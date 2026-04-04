import { generateLocalPart, validateLocalPart } from '@/utils/addressGenerator';
import CONFIG from '@/utils/config';
import { getDomains, getInbox, getEmail, deleteEmail } from '@/utils/api';
import {
  currentAddress,
  addressHistory,
  cachedEmails,
  unreadCount,
} from '@/utils/storage';
import type { RequestMessage } from '@/utils/messages';
import type { AddressInfo } from '@/utils/types';

export default defineBackground(() => {
  // --- Context menu (must be registered synchronously) ---
  browser.contextMenus.create({
    id: 'fill-meowmail',
    title: 'Fill with MeowMail address',
    contexts: ['editable'],
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== 'fill-meowmail' || !tab?.id) return;
    // Actual fill behavior handled in Step 4 (content script)
    // For now, just log
    console.log('Context menu clicked — fill behavior coming in Step 4');
  });

  // --- Badge setup ---
  browser.action.setBadgeBackgroundColor({ color: CONFIG.BADGE_COLOR });

  // --- On install: generate first address ---
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== 'install') return;

    getDomains()
      .then((domains) => {
        const domain = domains[0] || CONFIG.DEFAULT_DOMAIN;
        return initAddress(domain);
      })
      .catch(() => {
        // Fallback if API is unreachable: use default domain
        initAddress(CONFIG.DEFAULT_DOMAIN);
      });
  });

  // --- Message handler ---
  browser.runtime.onMessage.addListener(
    (message: RequestMessage, _sender, sendResponse) => {
      handleMessage(message).then(sendResponse);
      return true; // Keep channel open for async response
    },
  );

  // --- Helper: initialize a new address ---
  async function initAddress(domain: string) {
    const localPart = generateLocalPart();
    const address: AddressInfo = { localPart, domain };

    await currentAddress.setValue(address);
    await addToHistory(address);
    await refreshInbox(address);
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
  async function refreshInbox(address: AddressInfo) {
    try {
      const emails = await getInbox(address.domain, address.localPart);
      await cachedEmails.setValue(emails);
    } catch {
      // Non-critical: inbox might be empty or API down
      await cachedEmails.setValue([]);
    }
  }

  // --- Message dispatcher ---
  async function handleMessage(message: RequestMessage) {
    switch (message.type) {
      case 'GET_STATE': {
        return {
          currentAddress: await currentAddress.getValue(),
          addressHistory: await addressHistory.getValue(),
          cachedEmails: await cachedEmails.getValue(),
          unreadCount: await unreadCount.getValue(),
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
        refreshInbox(newAddress); // Fire and forget

        return { localPart, domain };
      }

      case 'SET_ADDRESS': {
        if (!validateLocalPart(message.localPart)) {
          return { success: false };
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
        refreshInbox(newAddress); // Fire and forget

        return { success: true };
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

      case 'CLEAR_BADGE': {
        await unreadCount.setValue(0);
        await updateBadge(0);
        return { success: true };
      }

      default:
        return null;
    }
  }

  // --- Helper: update badge text ---
  async function updateBadge(count: number) {
    await browser.action.setBadgeText({ text: count > 0 ? String(count) : '' });
  }
});
