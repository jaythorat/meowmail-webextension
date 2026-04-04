import type { StorageState, EmailSummary, EmailDetail, ConnectionStatus } from './types';

// Requests: Popup/Content → Background
export type RequestMessage =
  | { type: 'GET_STATE' }
  | { type: 'GENERATE_ADDRESS' }
  | { type: 'SET_ADDRESS'; localPart: string; domain: string }
  | { type: 'GET_EMAIL'; id: string }
  | { type: 'DELETE_EMAIL'; id: string }
  | { type: 'GET_CURRENT_ADDRESS' }
  | { type: 'CLEAR_BADGE' }
  | { type: 'REMOVE_FROM_HISTORY'; localPart: string; domain: string }
  | { type: 'CLEAR_HISTORY' };

// Response types per request
export type ResponseFor<T extends RequestMessage['type']> =
  T extends 'GET_STATE' ? StorageState :
  T extends 'GENERATE_ADDRESS' ? { localPart: string; domain: string; emails: EmailSummary[] } :
  T extends 'SET_ADDRESS' ? { success: boolean; emails: EmailSummary[] } :
  T extends 'GET_EMAIL' ? EmailDetail :
  T extends 'DELETE_EMAIL' ? { success: boolean } :
  T extends 'GET_CURRENT_ADDRESS' ? { localPart: string; domain: string } | null :
  T extends 'CLEAR_BADGE' ? { success: boolean } :
  T extends 'REMOVE_FROM_HISTORY' ? { success: boolean } :
  T extends 'CLEAR_HISTORY' ? { success: boolean } :
  never;

// Events: Background → Popup (push notifications)
export type EventMessage =
  | { type: 'STATE_UPDATE'; state: StorageState }
  | { type: 'NEW_EMAIL'; email: EmailSummary }
  | { type: 'EMAIL_EXPIRED'; id: string }
  | { type: 'CONNECTION_STATUS'; status: ConnectionStatus };

// Typed message sender for popup/content → background
export const sendMessage = <T extends RequestMessage>(
  message: T,
): Promise<ResponseFor<T['type']>> => {
  return browser.runtime.sendMessage(message);
};
