declare module 'phoenix' {
  export class Socket {
    constructor(endPoint: string, opts?: Record<string, unknown>);
    connect(): void;
    disconnect(): void;
    onOpen(callback: () => void): number;
    onClose(callback: () => void): number;
    onError(callback: (error: unknown) => void): number;
    channel(topic: string, params?: Record<string, unknown>): Channel;
    isConnected(): boolean;
  }

  export class Channel {
    on(event: string, callback: (payload: any) => void): number;
    off(event: string, ref?: number): void;
    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    onClose(callback: () => void): void;
    onError(callback: (reason: unknown) => void): void;
  }

  export class Push {
    receive(status: string, callback: (response: any) => void): Push;
  }
}
