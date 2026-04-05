import { useState, useEffect } from 'preact/hooks';
import { sendMessage } from '@/utils/messages';
import CONFIG from '@/utils/config';
import type { EmailDetail as EmailDetailType, Attachment, AddressInfo } from '@/utils/types';
import { attachmentDownloadUrl } from '@/utils/api';
import {
  ArrowLeftIcon,
  TrashIcon,
  DownloadIcon,
  ExternalLinkIcon,
  PaperclipIcon,
  ClockIcon,
  FileIcon,
} from './Icons';
import { showToast } from './Toast';

interface EmailDetailProps {
  emailId: string;
  address: AddressInfo | null;
  onBack: () => void;
  onDeleted: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeUntil(dateStr: string): string {
  const ms = new Date(dateStr).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function senderName(sender: string): string {
  const match = sender.match(/^(.+?)\s*<.+>$/);
  return match ? match[1] : sender;
}

function senderEmail(sender: string): string | null {
  const match = sender.match(/<(.+)>/);
  return match ? match[1] : null;
}

const EmailDetail = ({ emailId, address, onBack, onDeleted }: EmailDetailProps) => {
  const [email, setEmail] = useState<EmailDetailType | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHtml, setShowHtml] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    sendMessage({ type: 'GET_EMAIL', id: emailId })
      .then((detail) => {
        setEmail(detail);
        if (detail.html_body) setShowHtml(true);

        if (detail.has_attachments) {
          sendMessage({ type: 'GET_ATTACHMENTS', emailId }).then(setAttachments);
        }
      })
      .catch((err) => {
        const msg = err?.message?.includes('429')
          ? 'Too many requests, please wait'
          : 'Failed to load email';
        setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [emailId]);

  function buildSrcdoc(htmlBody: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #ede9e3;
      background: #111118;
      margin: 8px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    a { color: #f5a623; }
    img { max-width: 100%; height: auto; }
    table { max-width: 100%; }
    pre, code { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>${htmlBody}</body>
</html>`;
  }

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await sendMessage({ type: 'DELETE_EMAIL', id: emailId });
      onDeleted(emailId);
    } catch {
      setIsDeleting(false);
      showToast('Failed to delete email');
    }
  };

  const meowmailUrl = address
    ? `${CONFIG.SITE_URL}/inbox/${address.domain}/${address.localPart}?email=${emailId}`
    : null;

  if (isLoading) {
    return (
      <div class="flex flex-col h-full">
        <DetailHeader onBack={onBack} />
        <div class="flex-1 flex items-center justify-center">
          <div class="text-text-muted text-sm font-mono animate-pulse">Loading email...</div>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div class="flex flex-col h-full">
        <DetailHeader onBack={onBack} />
        <div class="flex-1 flex items-center justify-center">
          <div class="text-danger text-sm font-mono">{error || 'Email not found'}</div>
        </div>
      </div>
    );
  }

  const fromName = senderName(email.sender);
  const fromEmail = senderEmail(email.sender);
  const hasHtml = !!email.html_body;
  const hasText = !!email.text_body;
  const hasBothViews = hasHtml && hasText;

  return (
    <div class="flex flex-col h-full animate-fade-in">
      {/* Header bar */}
      <DetailHeader onBack={onBack}>
        <div class="flex items-center gap-1">
          {meowmailUrl && (
            <a
              href={meowmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="p-1.5 rounded-lg text-text-muted hover:text-amber hover:bg-amber-glow transition-colors"
              title="Open in MeowMail"
            >
              <ExternalLinkIcon class="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            class="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
            title="Delete email"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </DetailHeader>

      {/* Scrollable content */}
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        {/* Subject */}
        <h2 class="text-sm font-mono text-text-primary leading-snug mt-3">
          {email.subject || '(no subject)'}
        </h2>

        {/* Sender & meta */}
        <div class="mt-2 flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="text-xs font-mono text-text-secondary truncate">{fromName}</div>
            {fromEmail && (
              <div class="text-[10px] font-mono text-text-muted truncate">{fromEmail}</div>
            )}
          </div>
          <div class="text-right shrink-0">
            <div class="text-[10px] font-mono text-text-muted">
              {formatDate(email.received_at)}
            </div>
            <div class="flex items-center gap-1 text-[10px] font-mono text-amber-dim mt-0.5 justify-end">
              <ClockIcon class="w-3 h-3" />
              <span>{timeUntil(email.expires_at)}</span>
            </div>
          </div>
        </div>

        {/* View toggle (HTML / Text) */}
        {hasBothViews && (
          <div class="mt-3 flex gap-1">
            <button
              type="button"
              onClick={() => setShowHtml(true)}
              class={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                showHtml
                  ? 'bg-amber/15 text-amber border border-amber/30'
                  : 'text-text-muted border border-border hover:text-text-secondary'
              }`}
            >
              HTML
            </button>
            <button
              type="button"
              onClick={() => setShowHtml(false)}
              class={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                !showHtml
                  ? 'bg-amber/15 text-amber border border-amber/30'
                  : 'text-text-muted border border-border hover:text-text-secondary'
              }`}
            >
              Text
            </button>
          </div>
        )}

        {/* Email body */}
        <div class="mt-3 border-t border-border-subtle pt-3">
          {showHtml && hasHtml ? (
            <iframe
              srcdoc={buildSrcdoc(email.html_body!)}
              sandbox="allow-same-origin"
              class="w-full border-0 rounded-lg bg-surface min-h-[200px]"
              style="height: 300px;"
              title="Email content"
            />
          ) : hasText ? (
            <pre class="text-xs font-mono text-text-secondary whitespace-pre-wrap break-words leading-relaxed">
              {email.text_body}
            </pre>
          ) : (
            <div class="text-xs font-mono text-text-muted italic">No content available</div>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div class="mt-4 border-t border-border-subtle pt-3">
            <div class="flex items-center gap-1.5 mb-2">
              <PaperclipIcon class="w-3.5 h-3.5 text-text-muted" />
              <span class="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                Attachments ({attachments.length})
              </span>
            </div>
            <div class="flex flex-col gap-1.5">
              {attachments.map((att) => (
                <a
                  key={att.id}
                  href={attachmentDownloadUrl(emailId, att.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="card-hover flex items-center gap-2.5 !p-2.5 !rounded-lg"
                >
                  <FileIcon class="w-4 h-4 text-amber/60 shrink-0" />
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-mono text-text-primary truncate">
                      {att.filename}
                    </div>
                    <div class="text-[10px] font-mono text-text-muted">
                      {formatSize(att.size_bytes)}
                    </div>
                  </div>
                  <DownloadIcon class="w-3.5 h-3.5 text-text-muted shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component: top bar with back button
const DetailHeader = ({
  onBack,
  children,
}: {
  onBack: () => void;
  children?: preact.ComponentChildren;
}) => (
  <div class="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border-subtle">
    <button
      type="button"
      onClick={onBack}
      class="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors p-1 -ml-1"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      <span class="text-xs font-mono">Inbox</span>
    </button>
    {children}
  </div>
);

export default EmailDetail;
