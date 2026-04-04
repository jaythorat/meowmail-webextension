export interface EmailSummary {
  id: string;
  sender: string;
  subject: string;
  received_at: string;
  has_attachments: boolean;
}

export interface EmailDetail extends EmailSummary {
  text_body: string | null;
  html_body: string | null;
  expires_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
}

export interface AddressInfo {
  localPart: string;
  domain: string;
}

export interface AddressHistoryEntry extends AddressInfo {
  createdAt: string;
}

export interface StorageState {
  currentAddress: AddressInfo | null;
  addressHistory: AddressHistoryEntry[];
  cachedEmails: EmailSummary[];
  unreadCount: number;
  domains: string[];
}
