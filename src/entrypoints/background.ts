import { generateLocalPart, validateLocalPart } from '@/utils/addressGenerator';
import CONFIG from '@/utils/config';
import { getDomains, getInbox, getEmail, deleteEmail, getAttachments } from '@/utils/api';
import {
  currentAddress,
  cachedEmails,
  unreadCount,
  cachedDomains,
  addressHistory,
} from '@/utils/storage';
import { InboxSocket } from '@/utils/websocket';
import type { RequestMessage, EventMessage } from '@/utils/messages';
import type { AddressInfo, ConnectionStatus, EmailSummary } from '@/utils/types';

export default defineBackground(() => {
  // MV3 uses browser.action, MV2 uses browser.browserAction — WXT doesn't polyfill this
  const action = browser.action ?? browser.browserAction;

  let connectionStatus: ConnectionStatus = 'connecting';

  // --- WebSocket setup ---
  const inbox = new InboxSocket({
    async onNewEmail(email: EmailSummary) {
      // Prepend to cached emails
      const emails = await cachedEmails.getValue();
      const exists = emails.some((e) => e.id === email.id);
      if (!exists) {
        await cachedEmails.setValue([email, ...emails]);
      }

      // Increment unread count + badge
      const count = (await unreadCount.getValue()) + 1;
      await unreadCount.setValue(count);
      await updateBadge(count);

      // Push to popup
      broadcastEvent({ type: 'NEW_EMAIL', email });
    },

    async onEmailExpired(id: string) {
      const emails = await cachedEmails.getValue();
      await cachedEmails.setValue(emails.filter((e) => e.id !== id));

      broadcastEvent({ type: 'EMAIL_EXPIRED', id });
    },

    onStatusChange(status: ConnectionStatus) {
      connectionStatus = status;
      broadcastEvent({ type: 'CONNECTION_STATUS', status });
    },
  });

  // --- Context menu ---
  // removeAll first to avoid duplicate-ID errors on Firefox dev reload
  browser.contextMenus.removeAll(() => {
    browser.contextMenus.create({
      id: 'fill-meowmail',
      title: 'Fill with MeowMail address',
      contexts: ['editable'],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== 'fill-meowmail' || !tab?.id) return;
    browser.tabs.sendMessage(tab.id, { type: 'FILL_ACTIVE_FIELD' }).catch(() => {
      // Content script not injected on this page — ignore
    });
  });

  // --- Keyboard shortcut: copy address ---
  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'copy-address') return;
    const address = await currentAddress.getValue();
    if (!address) return;

    const email = `${address.localPart}@${address.domain}`;

    // Write to clipboard via the active tab's content script
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      browser.tabs.sendMessage(tab.id, { type: 'COPY_TO_CLIPBOARD', text: email }).catch(() => {
        // Content script not available — silent fail
      });
    }
  });

  // --- Badge setup ---
  action.setBadgeBackgroundColor({ color: CONFIG.BADGE_COLOR });

  // --- On install: generate first address ---
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== 'install') return;

    getDomains()
      .then((domains) => {
        cachedDomains.setValue(domains);
        const domain = domains[0] || CONFIG.DEFAULT_DOMAIN;
        return initAddress(domain);
      })
      .catch(() => {
        // Fallback if API is unreachable: use default domain
        cachedDomains.setValue([CONFIG.DEFAULT_DOMAIN]);
        initAddress(CONFIG.DEFAULT_DOMAIN);
      });
  });

  // --- On startup: reconnect WebSocket for active address ---
  bootstrapWebSocket();

  // --- Message handler ---
  // Chrome requires sendResponse + return true (no polyfill for Promise returns).
  // Firefox also supports this callback pattern natively.
  browser.runtime.onMessage.addListener(
    (message: RequestMessage, _sender, sendResponse) => {
      handleMessage(message).then(
        (response) => sendResponse(response),
        (err) => {
          // Pass error info so popup can show appropriate messages
          const isRateLimit = err?.isRateLimit || err?.status === 429;
          sendResponse({
            __error: true,
            message: isRateLimit
              ? 'Too many requests, please wait'
              : err?.message || "Can't reach MeowMail servers",
          });
        },
      );
      return true;
    },
  );

  // --- Helper: bootstrap WebSocket on startup/wake ---
  async function bootstrapWebSocket() {
    const address = await currentAddress.getValue();
    if (address) {
      inbox.joinChannel(address.localPart, address.domain);
    }
  }

  // --- Helper: initialize a new address ---
  async function initAddress(domain: string) {
    const localPart = generateLocalPart();
    const address: AddressInfo = { localPart, domain };

    await currentAddress.setValue(address);
    await addToHistory(address);
    await refreshInbox(address);
    inbox.joinChannel(localPart, domain);
  }

  // --- Helper: add address to history ---
  async function addToHistory(address: AddressInfo) {
    const history = await addressHistory.getValue();
    const exists = history.some(
      (h) => h.localPart === address.localPart && h.domain === address.domain,
    );
    if (exists) return;

    const entry = { ...address, createdAt: new Date().toISOString() };
    const updated = [entry, ...history].slice(0, CONFIG.MAX_HISTORY);
    await addressHistory.setValue(updated);
  }

  // --- Helper: fetch and cache inbox ---
  async function refreshInbox(address: AddressInfo): Promise<EmailSummary[]> {
    try {
      const emails = await getInbox(address.domain, address.localPart);
      await cachedEmails.setValue(emails);
      return emails;
    } catch {
      // Non-critical: inbox might be empty or API down
      await cachedEmails.setValue([]);
      return [];
    }
  }

  // --- Helper: broadcast event to all extension pages (popup, etc.) ---
  function broadcastEvent(event: EventMessage) {
    browser.runtime.sendMessage(event).catch(() => {
      // No listeners (popup closed) — ignore
    });
  }

  // --- Message dispatcher ---
  async function handleMessage(message: RequestMessage) {
    switch (message.type) {
      case 'GET_STATE': {
        const domains = await cachedDomains.getValue();
        return {
          currentAddress: await currentAddress.getValue(),
          addressHistory: await addressHistory.getValue(),
          cachedEmails: await cachedEmails.getValue(),
          unreadCount: await unreadCount.getValue(),
          domains: domains.length > 0 ? domains : [CONFIG.DEFAULT_DOMAIN],
          connectionStatus,
        };
      }

      case 'GENERATE_ADDRESS': {
        const address = await currentAddress.getValue();
        const domain = address?.domain || CONFIG.DEFAULT_DOMAIN;
        const localPart = generateLocalPart();
        const newAddress: AddressInfo = { localPart, domain };

        await currentAddress.setValue(newAddress);
        await addToHistory(newAddress);
        await cachedEmails.setValue([]);
        await unreadCount.setValue(0);
        await updateBadge(0);
        inbox.joinChannel(localPart, domain);
        const emails = await refreshInbox(newAddress);

        return { localPart, domain, emails };
      }

      case 'SET_ADDRESS': {
        if (!validateLocalPart(message.localPart)) {
          return { success: false, emails: [] };
        }
        const newAddress: AddressInfo = {
          localPart: message.localPart,
          domain: message.domain,
        };

        await currentAddress.setValue(newAddress);
        await addToHistory(newAddress);
        await cachedEmails.setValue([]);
        await unreadCount.setValue(0);
        await updateBadge(0);
        inbox.joinChannel(message.localPart, message.domain);
        const emails = await refreshInbox(newAddress);

        return { success: true, emails };
      }

      case 'GET_EMAIL': {
        return await getEmail(message.id);
      }

      case 'DELETE_EMAIL': {
        await deleteEmail(message.id);
        const emails = await cachedEmails.getValue();
        await cachedEmails.setValue(emails.filter((e) => e.id !== message.id));
        return { success: true };
      }

      case 'GET_CURRENT_ADDRESS': {
        return await currentAddress.getValue();
      }

      case 'GET_ATTACHMENTS': {
        return await getAttachments(message.emailId);
      }

      case 'CLEAR_BADGE': {
        await unreadCount.setValue(0);
        await updateBadge(0);
        return { success: true };
      }

      case 'REMOVE_FROM_HISTORY': {
        const history = await addressHistory.getValue();
        const updated = history.filter(
          (h) => !(h.localPart === message.localPart && h.domain === message.domain),
        );
        await addressHistory.setValue(updated);
        return { success: true };
      }

      case 'CLEAR_HISTORY': {
        await addressHistory.setValue([]);
        return { success: true };
      }

      default:
        return null;
    }
  }

  // --- Helper: update badge text ---
  async function updateBadge(count: number) {
    await action.setBadgeText({ text: count > 0 ? String(count) : '' });
  }
});
