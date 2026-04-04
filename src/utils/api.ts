import CONFIG from './config';
import type { EmailSummary, EmailDetail, Attachment } from './types';

export class ApiError extends Error {
  status: number;
  body: unknown;
  isRateLimit: boolean;

  constructor(status: number, body: unknown) {
    const detail = (body as { errors?: { detail?: string }; error?: string });
    const message = detail?.errors?.detail || detail?.error || `HTTP ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.isRateLimit = status === 429;
  }
}

const request = async (path: string, options: RequestInit = {}) => {
  const url = `${CONFIG.API_BASE_URL}${path}`;
  const { method = 'GET', ...rest } = options;

  const response = await fetch(url, {
    method,
    headers: {
      'Accept': 'application/json',
      ...(method !== 'GET' && method !== 'DELETE'
        ? { 'Content-Type': 'application/json' }
        : {}),
    },
    ...rest,
  });

  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body;
};

const get = (path: string, options?: RequestInit) =>
  request(path, { ...options, method: 'GET' });

const del = (path: string, options?: RequestInit) =>
  request(path, { ...options, method: 'DELETE' });

export const getDomains = (options?: RequestInit): Promise<string[]> =>
  get('/api/domains', options).then((data) => data.domains.map((d: { name: string }) => d.name));

export const getInbox = (
  domain: string,
  localPart: string,
  { before, ...options }: { before?: string } & RequestInit = {},
): Promise<EmailSummary[]> => {
  const query = before ? `?before=${encodeURIComponent(before)}` : '';
  const path = `/api/inbox/${encodeURIComponent(domain)}/${encodeURIComponent(localPart)}${query}`;
  return get(path, options).then((data) => data.emails);
};

export const getEmail = (id: string, options?: RequestInit): Promise<EmailDetail> =>
  get(`/api/emails/${encodeURIComponent(id)}`, options).then((data) => data.email);

export const deleteEmail = (id: string, options?: RequestInit): Promise<null> =>
  del(`/api/emails/${encodeURIComponent(id)}`, options);

export const getAttachments = (emailId: string, options?: RequestInit): Promise<Attachment[]> =>
  get(`/api/emails/${encodeURIComponent(emailId)}/attachments`, options)
    .then((data) => data.attachments);

export const attachmentDownloadUrl = (emailId: string, attachmentId: string): string =>
  `${CONFIG.API_BASE_URL}/api/emails/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`;
