import { action } from "satcheljs";
import type { TickerData, TradingPair, CandleData, OrderBook, RecentTrade } from "@/types/market";

export const setPairsLoading = action(
  "SET_PAIRS_LOADING",
  (loading: boolean) => ({ loading })
);

export const setTickersLoading = action(
  "SET_TICKERS_LOADING",
  (loading: boolean) => ({ loading })
);

export const setCandlesLoading = action(
  "SET_CANDLES_LOADING",
  (loading: boolean) => ({ loading })
);

export const setPairs = action(
  "SET_PAIRS",
  (pairs: TradingPair[]) => ({ pairs })
);

export const updateTicker = action(
  "UPDATE_TICKER",
  (ticker: TickerData) => ({ ticker })
);

export const updateTickers = action(
  "UPDATE_TICKERS",
  (tickers: TickerData[]) => ({ tickers })
);

export const setCandles = action(
  "SET_CANDLES",
  (candles: CandleData[]) => ({ candles })
);

export const updateLastCandle = action(
  "UPDATE_LAST_CANDLE",
  (candle: CandleData) => ({ candle })
);

export const setOrderBook = action(
  "SET_ORDER_BOOK",
  (orderBook: OrderBook) => ({ orderBook })
);

export const addRecentTrade = action(
  "ADD_RECENT_TRADE",
  (trade: RecentTrade) => ({ trade })
);

export const setMarketError = action(
  "SET_MARKET_ERROR",
  (error: string | null) => ({ error })
);
