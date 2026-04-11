import type {
  ExchangeInfoResponse,
  ExchangeInfoSymbol,
  KlineRaw,
  Ticker24hr,
} from "@/types/binance";
import type { CandleData, KlineInterval, TradingPair } from "@/types/market";

const BASE_URL = "https://api.binance.com/api/v3";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Binance API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTradingPairs(): Promise<TradingPair[]> {
  const data = await apiFetch<ExchangeInfoResponse>("/exchangeInfo");
  return data.symbols
    .filter(
      (s: ExchangeInfoSymbol) =>
        s.status === "TRADING" && s.quoteAsset === "USDT"
    )
    .map((s: ExchangeInfoSymbol) => ({
      symbol: s.symbol,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
    }));
}

export async function fetchAllTickers(): Promise<Ticker24hr[]> {
  return apiFetch<Ticker24hr[]>("/ticker/24hr");
}

export async function fetchTicker(symbol: string): Promise<Ticker24hr> {
  return apiFetch<Ticker24hr>(`/ticker/24hr?symbol=${symbol}`);
}

export async function fetchKlines(
  symbol: string,
  interval: KlineInterval = "15m",
  limit = 500
): Promise<CandleData[]> {
  const raw = await apiFetch<KlineRaw[]>(
    `/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  return raw.map((k: KlineRaw) => ({
    time: k[0] / 1000, // lightweight-charts expects seconds
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}
