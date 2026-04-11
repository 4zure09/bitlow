import { mutator } from "satcheljs";
import { getMarketStore } from "./marketStore";
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

const MAX_RECENT_TRADES = 50;

mutator(setPairsLoading, ({ loading }) => {
  getMarketStore().isLoadingPairs = loading;
});

mutator(setTickersLoading, ({ loading }) => {
  getMarketStore().isLoadingTickers = loading;
});

mutator(setCandlesLoading, ({ loading }) => {
  getMarketStore().isLoadingCandles = loading;
});

mutator(setPairs, ({ pairs }) => {
  getMarketStore().pairs = pairs;
});

mutator(updateTicker, ({ ticker }) => {
  getMarketStore().tickers.set(ticker.symbol, ticker);
});

mutator(updateTickers, ({ tickers }) => {
  const store = getMarketStore();
  tickers.forEach((t) => store.tickers.set(t.symbol, t));
});

mutator(setCandles, ({ candles }) => {
  getMarketStore().candles = candles;
});

mutator(updateLastCandle, ({ candle }) => {
  const store = getMarketStore();
  const candles = store.candles;
  if (candles.length === 0) return;
  const last = candles[candles.length - 1];
  if (last.time === candle.time) {
    candles[candles.length - 1] = candle;
  } else if (candle.time > last.time) {
    candles.push(candle);
  }
});

mutator(setOrderBook, ({ orderBook }) => {
  getMarketStore().orderBook = orderBook;
});

mutator(addRecentTrade, ({ trade }) => {
  const store = getMarketStore();
  store.recentTrades.unshift(trade);
  if (store.recentTrades.length > MAX_RECENT_TRADES) {
    store.recentTrades.length = MAX_RECENT_TRADES;
  }
});

mutator(setMarketError, ({ error }) => {
  getMarketStore().error = error;
});
