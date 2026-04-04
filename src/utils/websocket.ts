import { Socket } from 'phoenix';
import CONFIG from './config';
import type { EmailSummary, ConnectionStatus } from './types';

export interface InboxEvents {
  onNewEmail: (email: EmailSummary) => void;
  onEmailExpired: (id: string) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

/**
 * Manages a Phoenix Socket connection and inbox channel subscription.
 * Designed for use inside a service worker — call connect() to start,
 * switchChannel() when the address changes, disconnect() to tear down.
 */
export class InboxSocket {
  private socket: InstanceType<typeof Socket> | null = null;
  private channel: ReturnType<InstanceType<typeof Socket>['channel']> | null = null;
  private events: InboxEvents;
  private currentTopic: string | null = null;

  constructor(events: InboxEvents) {
    this.events = events;
  }

  connect() {
    if (this.socket) return;

    this.events.onStatusChange('connecting');

    this.socket = new Socket(CONFIG.WS_URL, {
      // Explicitly pass WebSocket — Phoenix looks for `global.WebSocket`
      // which resolves via `self` in service workers, but may fail in some
      // browser builds. Passing it directly is safer.
      transport: WebSocket,
      reconnectAfterMs: (tries: number) =>
        [1000, 2000, 5000, 10000][Math.min(tries - 1, 3)],
    });

    this.socket.onOpen(() => this.events.onStatusChange('connected'));
    this.socket.onError(() => this.events.onStatusChange('error'));
    this.socket.onClose(() => {
      // Only emit 'disconnected' if we were previously connected;
      // otherwise stay in 'connecting' or 'error' state
      this.events.onStatusChange('disconnected');
    });

    this.socket.connect();
  }

  /** Join (or switch to) the channel for the given address. */
  joinChannel(localPart: string, domain: string) {
    const topic = `inbox:${localPart}@${domain}`;
    if (topic === this.currentTopic && this.channel) return;

    this.leaveChannel();

    if (!this.socket) this.connect();

    this.channel = this.socket!.channel(topic);

    this.channel.on('new_email', (payload: EmailSummary) => {
      this.events.onNewEmail(payload);
    });

    this.channel.on('email_expired', (payload: { id: string }) => {
      this.events.onEmailExpired(payload.id);
    });

    this.channel
      .join()
      .receive('ok', () => {
        this.currentTopic = topic;
        this.events.onStatusChange('connected');
      })
      .receive('error', () => {
        this.events.onStatusChange('error');
      });
  }

  /** Leave the current channel without disconnecting the socket. */
  leaveChannel() {
    if (this.channel) {
      this.channel.leave();
      this.channel = null;
      this.currentTopic = null;
    }
  }

  /** Tear down everything. */
  disconnect() {
    this.leaveChannel();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
