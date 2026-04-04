import { useState, useEffect, useCallback } from 'preact/hooks';
import { sendMessage } from '@/utils/messages';
import CONFIG from '@/utils/config';
import type { AddressInfo, AddressHistoryEntry, EmailSummary } from '@/utils/types';

export function usePopupState() {
  const [address, setAddress] = useState<AddressInfo | null>(null);
  const [history, setHistory] = useState<AddressHistoryEntry[]>([]);
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [domains, setDomains] = useState<string[]>([CONFIG.DEFAULT_DOMAIN]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sendMessage({ type: 'GET_STATE' }).then((state) => {
      if (state.currentAddress) {
        setAddress(state.currentAddress);
        setHistory(state.addressHistory);
        setEmails(state.cachedEmails);
        setUnreadCount(state.unreadCount);
        if (state.domains.length > 0) setDomains(state.domains);
        setIsLoading(false);
      } else {
        // Edge case: popup opened before install handler finished
        sendMessage({ type: 'GENERATE_ADDRESS' }).then((result) => {
          setAddress({ localPart: result.localPart, domain: result.domain });
          setIsLoading(false);
        });
      }
    });

    sendMessage({ type: 'CLEAR_BADGE' });
  }, []);

  const generateAddress = useCallback(async () => {
    const result = await sendMessage({ type: 'GENERATE_ADDRESS' });
    const newAddress = { localPart: result.localPart, domain: result.domain };
    setAddress(newAddress);
    setEmails([]);
    setUnreadCount(0);
    const entry = { ...newAddress, createdAt: new Date().toISOString() };
    setHistory((prev) => [entry, ...prev].slice(0, CONFIG.MAX_HISTORY));
  }, []);

  const setCustomAddress = useCallback(
    async (localPart: string, domain: string) => {
      const result = await sendMessage({ type: 'SET_ADDRESS', localPart, domain });
      if (result.success) {
        setAddress({ localPart, domain });
        setEmails([]);
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

  return {
    address,
    history,
    emails,
    domains,
    unreadCount,
    isLoading,
    generateAddress,
    setCustomAddress,
    removeFromHistory,
    clearHistory,
  };
}
