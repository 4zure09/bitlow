import { createStore } from "satcheljs";
import { observable } from "mobx";
import type { TickerData, TradingPair, CandleData, OrderBook, RecentTrade } from "@/types/market";

export interface MarketStoreState {
  pairs: TradingPair[];
  tickers: Map<string, TickerData>;
  candles: CandleData[];
  orderBook: OrderBook | null;
  recentTrades: RecentTrade[];
  isLoadingPairs: boolean;
  isLoadingTickers: boolean;
  isLoadingCandles: boolean;
  error: string | null;
}

const initialState: MarketStoreState = {
  pairs: [],
  tickers: observable.map({}),
  candles: [],
  orderBook: null,
  recentTrades: [],
  isLoadingPairs: false,
  isLoadingTickers: false,
  isLoadingCandles: false,
  error: null,
};

export const getMarketStore = createStore("marketStore", initialState);
