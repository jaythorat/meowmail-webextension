import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import type { AddressInfo, AddressHistoryEntry } from '@/utils/types';
import CONFIG from '@/utils/config';
import { CopyIcon, CheckIcon, RefreshIcon, ClockIcon } from './Icons';
import AddressHistory from './AddressHistory';

interface AddressBarProps {
  address: AddressInfo | null;
  domains: string[];
  history: AddressHistoryEntry[];
  onGenerate: () => void;
  onSetAddress: (localPart: string, domain: string) => Promise<boolean>;
  onRemoveFromHistory: (localPart: string, domain: string) => void;
  onClearHistory: () => void;
}

const AddressBar = ({
  address,
  domains,
  history,
  onGenerate,
  onSetAddress,
  onRemoveFromHistory,
  onClearHistory,
}: AddressBarProps) => {
  const [editValue, setEditValue] = useState(address?.localPart ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (address) setEditValue(address.localPart);
  }, [address?.localPart]);

  // Close history dropdown on outside click
  useEffect(() => {
    if (!showHistory) return;
    const handler = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showHistory]);

  const fullAddress = address ? `${address.localPart}@${address.domain}` : '';
  const isValid = CONFIG.LOCAL_PART_PATTERN.test(editValue);
  const showError = isFocused && editValue.length > 0 && !isValid;

  const handleCopy = useCallback(async () => {
    if (!fullAddress) return;
    try {
      await navigator.clipboard.writeText(fullAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts
    }
  }, [fullAddress]);

  const handleInput = useCallback((e: Event) => {
    const value = (e.target as HTMLInputElement).value
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '');
    setEditValue(value);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (isValid && editValue !== address?.localPart && address) {
      onSetAddress(editValue, address.domain);
    } else if (!isValid && address) {
      setEditValue(address.localPart);
    }
  }, [editValue, isValid, address, onSetAddress]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      } else if (e.key === 'Escape') {
        setEditValue(address?.localPart ?? '');
        (e.target as HTMLInputElement).blur();
      }
    },
    [address],
  );

  const handleDomainChange = useCallback(
    (e: Event) => {
      const newDomain = (e.target as HTMLSelectElement).value;
      if (address) onSetAddress(address.localPart, newDomain);
    },
    [address, onSetAddress],
  );

  const handleHistorySelect = useCallback(
    (localPart: string, domain: string) => {
      onSetAddress(localPart, domain);
      setShowHistory(false);
    },
    [onSetAddress],
  );

  const handleGenerate = useCallback(() => {
    onGenerate();
    setShowHistory(false);
  }, [onGenerate]);

  const handleClearHistory = useCallback(() => {
    onClearHistory();
    setShowHistory(false);
  }, [onClearHistory]);

  // Loading skeleton
  if (!address) {
    return (
      <div class="px-4 py-5">
        <div class="rounded-xl border border-border bg-surface px-3 py-3">
          <div class="h-5 bg-elevated rounded w-3/4 animate-pulse" />
        </div>
        <div class="flex gap-2 mt-3">
          <div class="h-9 bg-elevated rounded-lg flex-1 animate-pulse" />
          <div class="h-9 bg-elevated rounded-lg flex-1 animate-pulse" />
          <div class="h-9 bg-elevated rounded-lg w-10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} class="px-4 pt-4 pb-3 relative">
      {/* Address container */}
      <div
        class={`
          flex items-center rounded-xl border px-3 py-2.5
          bg-surface transition-all duration-300
          ${isFocused ? 'border-amber/60 glow-amber' : 'border-border hover:border-amber/20'}
        `}
      >
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          spellcheck={false}
          autocomplete="off"
          class="bg-transparent text-text-primary font-mono text-sm outline-none min-w-[8ch] max-w-[18ch]"
          style={{ width: `${Math.max(editValue.length, 8)}ch` }}
        />

        <span class="text-amber font-mono text-sm mx-0.5 select-none">@</span>

        {domains.length > 1 ? (
          <select
            value={address.domain}
            onChange={handleDomainChange}
            class="bg-transparent text-text-secondary font-mono text-sm outline-none cursor-pointer appearance-none hover:text-text-primary transition-colors pr-4"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238a8694' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0 center',
            }}
          >
            {domains.map((d) => (
              <option key={d} value={d} class="bg-surface text-text-primary">
                {d}
              </option>
            ))}
          </select>
        ) : (
          <span class="text-text-secondary font-mono text-sm">{address.domain}</span>
        )}
      </div>

      {/* Validation hint */}
      {showError && (
        <p class="text-danger text-[11px] font-mono mt-1.5 px-1 animate-fade-in">
          3–31 chars · starts with letter or number · a-z 0-9 . _ -
        </p>
      )}

      {/* Action buttons */}
      <div class="flex items-center gap-2 mt-3">
        <button
          type="button"
          onClick={handleCopy}
          class={`btn-ghost flex-1 justify-center text-xs py-2 ${
            isCopied ? 'border-success/40 text-success' : ''
          }`}
        >
          {isCopied ? (
            <>
              <CheckIcon class="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon class="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleGenerate}
          class="btn-ghost flex-1 justify-center text-xs py-2"
        >
          <RefreshIcon class="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          class={`btn-ghost justify-center text-xs py-2 px-3 ${
            showHistory ? 'border-amber/40 text-amber' : ''
          }`}
          title="Address history"
        >
          <ClockIcon class="w-3.5 h-3.5" />
        </button>
      </div>

      {/* History dropdown */}
      {showHistory && (
        <AddressHistory
          history={history}
          currentAddress={address}
          onSelect={handleHistorySelect}
          onRemove={onRemoveFromHistory}
          onClearAll={handleClearHistory}
        />
      )}
    </div>
  );
};

export default AddressBar;
