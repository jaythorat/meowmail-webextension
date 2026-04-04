import type { EmailSummary } from '@/utils/types';
import { MailIcon, PaperclipIcon, InboxIcon } from './Icons';

interface EmailListProps {
  emails: EmailSummary[];
  onSelect: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function senderName(sender: string): string {
  // "Name <email>" → "Name", plain email stays as-is
  const match = sender.match(/^(.+?)\s*<.+>$/);
  return match ? match[1] : sender;
}

const EmailItem = ({
  email,
  onSelect,
}: {
  email: EmailSummary;
  onSelect: (id: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(email.id)}
    class="card-hover w-full text-left px-3 py-2.5 flex gap-3 items-start animate-fade-up"
  >
    <div class="mt-0.5 shrink-0 text-amber/60">
      <MailIcon class="w-4 h-4" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-mono text-text-primary truncate">
          {senderName(email.sender)}
        </span>
        <span class="text-[10px] font-mono text-text-muted whitespace-nowrap shrink-0">
          {timeAgo(email.received_at)}
        </span>
      </div>

      <div class="flex items-center gap-1.5 mt-0.5">
        <span class="text-xs font-mono text-text-secondary truncate">
          {email.subject || '(no subject)'}
        </span>
        {email.has_attachments && (
          <PaperclipIcon class="w-3 h-3 text-text-muted shrink-0" />
        )}
      </div>
    </div>
  </button>
);

const EmptyState = () => (
  <div class="card flex flex-col items-center justify-center py-8 text-center">
    <InboxIcon class="w-6 h-6 text-text-muted mb-2" />
    <p class="text-text-secondary text-sm font-mono">No emails yet</p>
    <p class="text-text-muted text-xs font-mono mt-1">
      Use this address and emails will appear here
    </p>
  </div>
);

const EmailList = ({ emails, onSelect }: EmailListProps) => (
  <div class="px-4 pb-4">
    <div class="border-t border-border-subtle pt-3">
      <h2 class="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Inbox {emails.length > 0 && `(${emails.length})`}
      </h2>

      {emails.length === 0 ? (
        <EmptyState />
      ) : (
        <div class="flex flex-col gap-1.5">
          {emails.map((email) => (
            <EmailItem key={email.id} email={email} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default EmailList;
