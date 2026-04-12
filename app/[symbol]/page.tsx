"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getMarketStore } from "@/stores/market/marketStore";
import { getSettingsStore } from "@/stores/settings/settingsStore";
import { toggleFavorite } from "@/stores/settings/settingsActions";
import {
  loadCandles,
  startKlineStream,
  stopKlineStream,
  startDepthStream,
  stopDepthStream,
  startTradeStream,
  stopTradeStream,
} from "@/stores/market/marketOrchestrators";
import { setCandles } from "@/stores/market/marketActions";
import { CandlestickChart } from "@/components/chart/CandlestickChart";
import { OrderBook } from "@/components/market/OrderBook";
import { RecentTrades } from "@/components/market/RecentTrades";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastContainer } from "@/components/ui/Toast";
import type { KlineInterval } from "@/types/market";

const INTERVALS: { value: KlineInterval; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1D" },
];

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 8,
  });
}

interface TokenDetailProps {
  params: Promise<{ symbol: string }>;
}

const TokenDetail = observer(function TokenDetail({ params }: TokenDetailProps) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();
  const t = useTranslations("detail");
  const store = getMarketStore();
  const settings = getSettingsStore();
  const [interval, setInterval] = useState<KlineInterval>("15m");
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">("orderbook");

  const ticker = store.tickers.get(upperSymbol);
  const isFavorite = settings.favorites.includes(upperSymbol);
  const baseAsset = upperSymbol.replace("USDT", "");

  // Reset candles on symbol change
  useEffect(() => {
    setCandles([]);
  }, [upperSymbol]);

  // Klines
  useEffect(() => {
    loadCandles(upperSymbol, interval);
    startKlineStream(upperSymbol, interval);
    return () => {
      stopKlineStream();
    };
  }, [upperSymbol, interval]);

  // Depth + Trades
  useEffect(() => {
    startDepthStream(upperSymbol);
    startTradeStream(upperSymbol);
    return () => {
      stopDepthStream();
      stopTradeStream();
    };
  }, [upperSymbol]);

  const isPositive = (ticker?.priceChangePercent ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Breadcrumb + Header */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("back")}
          </Link>
          <span className="text-[var(--card-border)]">/</span>
          <span className="text-[var(--foreground)] font-medium">{upperSymbol}</span>
        </div>

        {/* Symbol info bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent)]/20 rounded-full flex items-center justify-center text-[var(--accent)] font-bold">
              {baseAsset.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)]">{baseAsset}</h1>
              <span className="text-[var(--muted-foreground)] text-sm">/ USDT</span>
            </div>
          </div>

          {ticker ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-[var(--foreground)]">
                  ${formatPrice(ticker.price)}
                </span>
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded ${
                    isPositive
                      ? "text-[var(--green)]"
                      : "text-[var(--red)]"
                  }`}
                >
                  {isPositive ? "+" : ""}{ticker.priceChangePercent.toFixed(2)}%
                </span>
              </div>

              <div className="flex gap-6 ml-auto text-sm">
                <div>
                  <p className="text-[var(--muted-foreground)] text-xs">24h High</p>
                  <p className="font-mono text-[var(--green)]">${formatPrice(ticker.highPrice)}</p>
                </div>
                <div>
                  <p className="text-[var(--muted-foreground)] text-xs">24h Low</p>
                  <p className="font-mono text-[var(--red)]">${formatPrice(ticker.lowPrice)}</p>
                </div>
                <div>
                  <p className="text-[var(--muted-foreground)] text-xs">24h Volume</p>
                  <p className="font-mono text-[var(--foreground)]">
                    ${(ticker.volume / 1e6).toFixed(2)}M
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-8 w-32 bg-[var(--card-border)] rounded animate-pulse" />
          )}

          {/* Favorite button */}
          <button
            onClick={() => toggleFavorite(upperSymbol)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-sm ${
              isFavorite
                ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                : "border-[var(--card-border)] text-[var(--muted-foreground)] hover:border-yellow-400 hover:text-yellow-400"
            }`}
          >
            {isFavorite ? "★" : "☆"}
            <span>{isFavorite ? "Watching" : "Watch"}</span>
          </button>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart (takes 2/3 on desktop) */}
          <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
            {/* Interval selector */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
              <h2 className="text-sm font-medium text-[var(--foreground)]">{t("chart")}</h2>
              <div className="flex gap-1">
                {INTERVALS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setInterval(value)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      interval === value
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-96">
              <ErrorBoundary>
                <CandlestickChart symbol={upperSymbol} />
              </ErrorBoundary>
            </div>
          </div>

          {/* Order Book + Trades (1/3 on desktop) */}
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[var(--card-border)]">
              <button
                onClick={() => setActiveTab("orderbook")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "orderbook"
                    ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {t("orderBook")}
              </button>
              <button
                onClick={() => setActiveTab("trades")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "trades"
                    ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {t("recentTrades")}
              </button>
            </div>
            <div className="p-3">
              {activeTab === "orderbook" ? <OrderBook /> : <RecentTrades />}
            </div>
          </div>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
});

export default function SymbolPage({ params }: TokenDetailProps) {
  return (
    <ErrorBoundary>
      <TokenDetail params={params} />
    </ErrorBoundary>
  );
}
