const WS_BASE = "wss://stream.binance.com:9443/ws";

const MIN_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

export type WsMessageHandler<T> = (data: T) => void;

export interface WsConnection {
  close: () => void;
}

interface WsManagerOptions<T> {
  streamPath: string;
  onMessage: WsMessageHandler<T>;
  onError?: (event: Event) => void;
}

function createWsConnection<T>(options: WsManagerOptions<T>): WsConnection {
  const { streamPath, onMessage, onError } = options;
  let ws: WebSocket | null = null;
  let backoffMs = MIN_BACKOFF_MS;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function connect() {
    if (closed) return;

    ws = new WebSocket(`${WS_BASE}/${streamPath}`);

    ws.onopen = () => {
      backoffMs = MIN_BACKOFF_MS;
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as T;
        onMessage(data);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = (event: Event) => {
      onError?.(event);
    };

    ws.onclose = () => {
      if (closed) return;
      reconnectTimer = setTimeout(() => {
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
        connect();
      }, backoffMs);
    };
  }

  connect();

  return {
    close() {
      closed = true;
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      ws?.close();
      ws = null;
    },
  };
}

export function connectMiniTicker<T>(
  onMessage: WsMessageHandler<T>
): WsConnection {
  return createWsConnection<T>({
    streamPath: "!miniTicker@arr",
    onMessage,
  });
}

export function connectKlineStream<T>(
  symbol: string,
  interval: string,
  onMessage: WsMessageHandler<T>
): WsConnection {
  return createWsConnection<T>({
    streamPath: `${symbol.toLowerCase()}@kline_${interval}`,
    onMessage,
  });
}

export function connectDepthStream<T>(
  symbol: string,
  onMessage: WsMessageHandler<T>
): WsConnection {
  return createWsConnection<T>({
    streamPath: `${symbol.toLowerCase()}@depth20@100ms`,
    onMessage,
  });
}

export function connectTradeStream<T>(
  symbol: string,
  onMessage: WsMessageHandler<T>
): WsConnection {
  return createWsConnection<T>({
    streamPath: `${symbol.toLowerCase()}@trade`,
    onMessage,
  });
}
