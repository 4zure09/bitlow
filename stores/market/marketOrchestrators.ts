import { orchestrator, action } from "satcheljs";
import { fetchTradingPairs, fetchAllTickers, fetchKlines } from "@/lib/binance/rest";
import {
  connectMiniTicker,
  connectKlineStream,
  connectDepthStream,
  connectTradeStream,
} from "@/lib/binance/websocket";
import type { MiniTickerWsPayload, KlineWsPayload, DepthWsPayload, TradeWsPayload } from "@/types/binance";
import type { KlineInterval, TickerData } from "@/types/market";
import {
  setPairsLoading,
  setTickersLoading,
  setCandlesLoading,
  setPairs,
  updateTicker,
  updateTickers,
  setCandles,
  updateLastCandle,
  setOrderBook,
  addRecentTrade,
  setMarketError,
} from "./marketActions";
import { getMarketStore } from "./marketStore";
import type { WsConnection } from "@/lib/binance/websocket";

// Batch WS updates every 200ms to avoid flooding React
let tickerBatch: TickerData[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleBatchFlush() {
  if (batchTimer !== null) return;
  batchTimer = setTimeout(() => {
    batchTimer = null;
    if (tickerBatch.length > 0) {
      updateTickers(tickerBatch);
      tickerBatch = [];
    }
  }, 200);
}

// ─── Init Market Data ──────────────────────────────────────────────────────────

export const initMarketData = action("INIT_MARKET_DATA", () => ({}));

orchestrator(initMarketData, async () => {
  try {
    setPairsLoading(true);
    setTickersLoading(true);

    const [pairs, tickers] = await Promise.all([
      fetchTradingPairs(),
      fetchAllTickers(),
    ]);

    setPairs(pairs);

    const pairSymbols = new Set(pairs.map((p) => p.symbol));

    const tickerData: TickerData[] = tickers
      .filter((t) => pairSymbols.has(t.symbol))
      .map((t) => ({
        symbol: t.symbol,
        price: parseFloat(t.lastPrice),
        priceChange: parseFloat(t.priceChange),
        priceChangePercent: parseFloat(t.priceChangePercent),
        volume: parseFloat(t.quoteVolume),
        highPrice: parseFloat(t.highPrice),
        lowPrice: parseFloat(t.lowPrice),
        direction: "neutral" as const,
        lastUpdated: Date.now(),
      }));

    updateTickers(tickerData);
    setPairsLoading(false);
    setTickersLoading(false);
  } catch (err) {
    setMarketError(err instanceof Error ? err.message : "Failed to load market data");
    setPairsLoading(false);
    setTickersLoading(false);
  }
});

// ─── Mini Ticker WebSocket ─────────────────────────────────────────────────────

export const startMarketStream = action("START_MARKET_STREAM", () => ({}));

let marketStreamConnection: WsConnection | null = null;

orchestrator(startMarketStream, () => {
  marketStreamConnection?.close();

  marketStreamConnection = connectMiniTicker<MiniTickerWsPayload[]>((payloads) => {
    const store = getMarketStore();

    payloads.forEach((p) => {
      if (!store.tickers.has(p.s)) return;

      const existing = store.tickers.get(p.s);
      const newPrice = parseFloat(p.c);
      const oldPrice = existing?.price ?? newPrice;

      const ticker: TickerData = {
        symbol: p.s,
        price: newPrice,
        priceChange: newPrice - parseFloat(p.o),
        priceChangePercent: ((newPrice - parseFloat(p.o)) / parseFloat(p.o)) * 100,
        volume: parseFloat(p.q),
        highPrice: parseFloat(p.h),
        lowPrice: parseFloat(p.l),
        direction: newPrice > oldPrice ? "up" : newPrice < oldPrice ? "down" : "neutral",
        lastUpdated: p.E,
      };

      tickerBatch.push(ticker);
    });

    scheduleBatchFlush();
  });
});

export const stopMarketStream = action("STOP_MARKET_STREAM", () => ({}));

orchestrator(stopMarketStream, () => {
  marketStreamConnection?.close();
  marketStreamConnection = null;
});

// ─── Candle / Kline Data ───────────────────────────────────────────────────────

export const loadCandles = action(
  "LOAD_CANDLES",
  (symbol: string, interval: KlineInterval) => ({ symbol, interval })
);

orchestrator(loadCandles, async ({ symbol, interval }) => {
  try {
    setCandlesLoading(true);
    const candles = await fetchKlines(symbol, interval);
    setCandles(candles);
    setCandlesLoading(false);
  } catch (err) {
    setMarketError(err instanceof Error ? err.message : "Failed to load candles");
    setCandlesLoading(false);
  }
});

// ─── Kline WebSocket ───────────────────────────────────────────────────────────

export const startKlineStream = action(
  "START_KLINE_STREAM",
  (symbol: string, interval: KlineInterval) => ({ symbol, interval })
);

let klineConnection: WsConnection | null = null;

orchestrator(startKlineStream, ({ symbol, interval }) => {
  klineConnection?.close();

  klineConnection = connectKlineStream<KlineWsPayload>(
    symbol,
    interval,
    (payload) => {
      const k = payload.k;
      updateLastCandle({
        time: k.t / 1000,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
      });
    }
  );
});

export const stopKlineStream = action("STOP_KLINE_STREAM", () => ({}));

orchestrator(stopKlineStream, () => {
  klineConnection?.close();
  klineConnection = null;
});

// ─── Order Book WebSocket ──────────────────────────────────────────────────────

export const startDepthStream = action(
  "START_DEPTH_STREAM",
  (symbol: string) => ({ symbol })
);

let depthConnection: WsConnection | null = null;

orchestrator(startDepthStream, ({ symbol }) => {
  depthConnection?.close();

  depthConnection = connectDepthStream<DepthWsPayload>(symbol, (payload) => {
    const toEntry = (
      arr: [string, string][],
      reverse = false
    ) => {
      const entries = arr.map(([price, qty]) => ({
        price: parseFloat(price),
        quantity: parseFloat(qty),
        total: parseFloat(price) * parseFloat(qty),
      }));
      return reverse ? entries.reverse() : entries;
    };

    setOrderBook({
      symbol,
      bids: toEntry(payload.bids, true),
      asks: toEntry(payload.asks),
      lastUpdateId: payload.lastUpdateId,
    });
  });
});

export const stopDepthStream = action("STOP_DEPTH_STREAM", () => ({}));

orchestrator(stopDepthStream, () => {
  depthConnection?.close();
  depthConnection = null;
});

// ─── Recent Trades WebSocket ───────────────────────────────────────────────────

export const startTradeStream = action(
  "START_TRADE_STREAM",
  (symbol: string) => ({ symbol })
);

let tradeConnection: WsConnection | null = null;

orchestrator(startTradeStream, ({ symbol }) => {
  tradeConnection?.close();

  tradeConnection = connectTradeStream<TradeWsPayload>(symbol, (payload) => {
    addRecentTrade({
      id: payload.t,
      symbol: payload.s,
      price: parseFloat(payload.p),
      quantity: parseFloat(payload.q),
      time: payload.T,
      isBuyerMaker: payload.m,
    });
  });
});

export const stopTradeStream = action("STOP_TRADE_STREAM", () => ({}));

orchestrator(stopTradeStream, () => {
  tradeConnection?.close();
  tradeConnection = null;
});
