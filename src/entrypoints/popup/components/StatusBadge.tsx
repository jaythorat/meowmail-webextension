import type { ConnectionStatus } from '@/utils/types';

interface StatusBadgeProps {
  status: ConnectionStatus;
}

const labels: Record<ConnectionStatus, string> = {
  connecting: 'Connecting…',
  connected: 'Connected',
  disconnected: 'Reconnecting…',
  error: 'Connection error',
};

const dotColors: Record<ConnectionStatus, string> = {
  connecting: 'bg-amber',
  connected: 'bg-success',
  disconnected: 'bg-amber',
  error: 'bg-danger',
};

const pulsingStates = new Set<ConnectionStatus>(['connecting', 'disconnected']);

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <div class="flex items-center gap-1.5" title={labels[status]}>
    <span
      class={`w-1.5 h-1.5 rounded-full ${dotColors[status]} ${
        pulsingStates.has(status) ? 'animate-pulse' : ''
      }`}
    />
    <span class="text-[10px] font-mono text-text-muted">{labels[status]}</span>
  </div>
);

export default StatusBadge;
