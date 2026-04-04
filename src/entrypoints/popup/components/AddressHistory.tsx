import type { AddressInfo, AddressHistoryEntry } from '@/utils/types';
import { ClockIcon, XIcon } from './Icons';

interface AddressHistoryProps {
  history: AddressHistoryEntry[];
  currentAddress: AddressInfo | null;
  onSelect: (localPart: string, domain: string) => void;
  onRemove: (localPart: string, domain: string) => void;
  onClearAll: () => void;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const AddressHistory = ({
  history,
  currentAddress,
  onSelect,
  onRemove,
  onClearAll,
}: AddressHistoryProps) => {
  const filtered = history.filter(
    (h) =>
      !(
        currentAddress &&
        h.localPart === currentAddress.localPart &&
        h.domain === currentAddress.domain
      ),
  );

  if (filtered.length === 0) {
    return (
      <div class="absolute left-0 right-0 top-full mt-1 z-50 animate-slide-down">
        <div class="rounded-xl bg-surface border border-border shadow-lg p-4">
          <p class="text-xs font-mono text-text-muted text-center">No other addresses yet</p>
        </div>
      </div>
    );
  }

  return (
    <div class="absolute left-0 right-0 top-full mt-1 z-50 animate-slide-down">
      <div class="rounded-xl bg-surface border border-border shadow-lg overflow-hidden">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-border-subtle">
          <ClockIcon class="w-3 h-3 text-text-muted" />
          <span class="text-[11px] font-mono text-text-muted">Recent addresses</span>
        </div>
        <ul class="max-h-48 overflow-y-auto">
          {filtered.map((entry) => (
            <li key={`${entry.localPart}@${entry.domain}`}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(entry.localPart, entry.domain);
                }}
                class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors duration-150 group"
              >
                <span class="text-xs font-mono truncate">
                  <span class="text-amber">{entry.localPart}</span>
                  <span class="text-text-muted">@{entry.domain}</span>
                </span>
                <span class="ml-auto text-[10px] font-mono text-text-muted/50 shrink-0">
                  {timeAgo(entry.createdAt)}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(entry.localPart, entry.domain);
                  }}
                  class="p-0.5 rounded text-text-muted/30 hover:text-danger transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <XIcon class="w-3 h-3" />
                </span>
              </button>
            </li>
          ))}
        </ul>
        {filtered.length > 1 && (
          <div class="border-t border-border-subtle px-3 py-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onClearAll();
              }}
              class="text-[11px] font-mono text-text-muted hover:text-danger transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressHistory;
