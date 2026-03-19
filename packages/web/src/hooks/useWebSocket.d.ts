export interface WebSocketMessage {
    type: 'devices' | 'log' | 'heartbeat';
    data: any;
}
export interface UseWebSocketOptions {
    url?: string;
    maxReconnectAttempts?: number;
}
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';
export declare function useWebSocket(onMessage: (message: WebSocketMessage) => void, options?: UseWebSocketOptions): {
    connect: () => void;
    disconnect: () => void;
    connectionState: ConnectionState;
};
//# sourceMappingURL=useWebSocket.d.ts.map