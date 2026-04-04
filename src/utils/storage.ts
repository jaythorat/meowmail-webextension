import { storage } from 'wxt/utils/storage';
import type { AddressInfo, AddressHistoryEntry, EmailSummary } from './types';

export const currentAddress = storage.defineItem<AddressInfo | null>(
  'local:currentAddress',
  { fallback: null },
);

export const addressHistory = storage.defineItem<AddressHistoryEntry[]>(
  'local:addressHistory',
  { fallback: [] },
);

export const cachedEmails = storage.defineItem<EmailSummary[]>(
  'local:cachedEmails',
  { fallback: [] },
);

export const unreadCount = storage.defineItem<number>(
  'local:unreadCount',
  { fallback: 0 },
);

export const cachedDomains = storage.defineItem<string[]>(
  'local:cachedDomains',
  { fallback: [] },
);
