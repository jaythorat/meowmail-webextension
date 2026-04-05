import { useState, useEffect, useCallback } from 'preact/hooks';
import { sendMessage } from '@/utils/messages';
import type { EventMessage } from '@/utils/messages';
import CONFIG from '@/utils/config';
import type { AddressInfo, AddressHistoryEntry, EmailSummary, ConnectionStatus } from '@/utils/types';
import { showToast } from '../components/Toast';

export function usePopupState() {
  const [address, setAddress] = useState<AddressInfo | null>(null);
  const [history, setHistory] = useState<AddressHistoryEntry[]>([]);
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [domains, setDomains] = useState<string[]>([CONFIG.DEFAULT_DOMAIN]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  useEffect(() => {
    sendMessage({ type: 'GET_STATE' })
      .then((state) => {
        if (state.currentAddress) {
          setAddress(state.currentAddress);
          setHistory(state.addressHistory);
          setEmails(state.cachedEmails);
          setUnreadCount(state.unreadCount);
          setConnectionStatus(state.connectionStatus);
          if (state.domains.length > 0) setDomains(state.domains);
          setIsLoading(false);
        } else {
          return sendMessage({ type: 'GENERATE_ADDRESS' }).then((result) => {
            setAddress({ localPart: result.localPart, domain: result.domain });
            setIsLoading(false);
          });
        }
      })
      .catch(() => {
        setIsLoading(false);
        showToast("Can't reach MeowMail servers");
      });

    sendMessage({ type: 'CLEAR_BADGE' }).catch(() => {});

    // Listen for push events from the background worker
    const listener = (message: EventMessage) => {
      switch (message.type) {
        case 'NEW_EMAIL':
          setEmails((prev) => {
            if (prev.some((e) => e.id === message.email.id)) return prev;
            return [message.email, ...prev];
          });
          break;
        case 'EMAIL_EXPIRED':
          setEmails((prev) => prev.filter((e) => e.id !== message.id));
          break;
        case 'CONNECTION_STATUS':
          setConnectionStatus(message.status);
          break;
      }
    };

    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  const generateAddress = useCallback(async () => {
    try {
      const result = await sendMessage({ type: 'GENERATE_ADDRESS' });
      const newAddress = { localPart: result.localPart, domain: result.domain };
      setAddress(newAddress);
      setEmails(result.emails);
      setUnreadCount(0);
      const entry = { ...newAddress, createdAt: new Date().toISOString() };
      setHistory((prev) => [entry, ...prev].slice(0, CONFIG.MAX_HISTORY));
    } catch {
      showToast("Can't reach MeowMail servers");
    }
  }, []);

  const setCustomAddress = useCallback(
    async (localPart: string, domain: string) => {
      try {
        const result = await sendMessage({ type: 'SET_ADDRESS', localPart, domain });
        if (result.success) {
          setAddress({ localPart, domain });
          setEmails(result.emails);
          setUnreadCount(0);
          const entry = { localPart, domain, createdAt: new Date().toISOString() };
          setHistory((prev) => {
            const filtered = prev.filter(
              (h) => !(h.localPart === localPart && h.domain === domain),
            );
            return [entry, ...filtered].slice(0, CONFIG.MAX_HISTORY);
          });
        }
        return result.success;
      } catch {
        showToast("Can't reach MeowMail servers");
        return false;
      }
    },
    [],
  );

  const removeFromHistory = useCallback(
    async (localPart: string, domain: string) => {
      await sendMessage({ type: 'REMOVE_FROM_HISTORY', localPart, domain });
      setHistory((prev) =>
        prev.filter((h) => !(h.localPart === localPart && h.domain === domain)),
      );
    },
    [],
  );

  const clearHistory = useCallback(async () => {
    await sendMessage({ type: 'CLEAR_HISTORY' });
    setHistory([]);
  }, []);

  const selectEmail = useCallback((id: string) => {
    setSelectedEmailId(id);
  }, []);

  const deselectEmail = useCallback(() => {
    setSelectedEmailId(null);
  }, []);

  const handleEmailDeleted = useCallback((id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
    setSelectedEmailId(null);
  }, []);

  return {
    address,
    history,
    emails,
    domains,
    unreadCount,
    connectionStatus,
    isLoading,
    selectedEmailId,
    generateAddress,
    setCustomAddress,
    removeFromHistory,
    clearHistory,
    selectEmail,
    deselectEmail,
    handleEmailDeleted,
  };
}
