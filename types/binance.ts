// REST API Types

export interface ExchangeInfoSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export interface ExchangeInfoResponse {
  symbols: ExchangeInfoSymbol[];
}

export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
}

// Kline: [openTime, open, high, low, close, volume, closeTime, ...]
export type KlineRaw = [
  number, // 0: open time
  string, // 1: open
  string, // 2: high
  string, // 3: low
  string, // 4: close
  string, // 5: volume
  number, // 6: close time
  string, // 7: quote asset volume
  number, // 8: number of trades
  string, // 9: taker buy base asset volume
  string, // 10: taker buy quote asset volume
  string  // 11: ignore
];

// WebSocket Payload Types

export interface MiniTickerWsPayload {
  e: "24hrMiniTicker";
  E: number;   // event time
  s: string;   // symbol
  c: string;   // close price
  o: string;   // open price
  h: string;   // high price
  l: string;   // low price
  v: string;   // total traded base asset volume
  q: string;   // total traded quote asset volume
}

export interface KlineWsData {
  t: number;   // kline start time
  T: number;   // kline close time
  s: string;   // symbol
  i: string;   // interval
  o: string;   // open price
  c: string;   // close price
  h: string;   // high price
  l: string;   // low price
  v: string;   // base asset volume
  x: boolean;  // is kline closed
}

export interface KlineWsPayload {
  e: "kline";
  E: number;
  s: string;
  k: KlineWsData;
}

export interface DepthLevel {
  price: string;
  quantity: string;
}

export interface DepthWsPayload {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface TradeWsPayload {
  e: "trade";
  E: number;
  s: string;
  t: number;   // trade id
  p: string;   // price
  q: string;   // quantity
  T: number;   // trade time
  m: boolean;  // is buyer market maker
}
