"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getMarketStore } from "@/stores/market/marketStore";
import { getSettingsStore } from "@/stores/settings/settingsStore";
import {
  initMarketData,
  startMarketStream,
  stopMarketStream,
} from "@/stores/market/marketOrchestrators";
import { MarketTable } from "@/components/market/MarketCard";
import { Navbar } from "@/components/layout/Navbar";
import { MarketTableSkeleton } from "@/components/ui/SkeletonLoader";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const POPULAR_SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT",
  "SOLUSDT", "DOGEUSDT", "DOTUSDT", "LTCUSDT", "LINKUSDT",
];

const DashboardPage = observer(function DashboardPage() {
  const t = useTranslations("dashboard");
  const store = getMarketStore();
  const settings = getSettingsStore();
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    initMarketData();
    startMarketStream();
    return () => {
      stopMarketStream();
    };
  }, []);

  const allSymbols: string[] = useMemo(() => {
    const pairSymbols = store.pairs.map((p) => p.symbol);
    // put popular ones first
    const popular = POPULAR_SYMBOLS.filter((s) => pairSymbols.includes(s));
    const rest = pairSymbols.filter((s) => !POPULAR_SYMBOLS.includes(s));
    return [...popular, ...rest];
  }, [store.pairs]);

  const displaySymbols = useMemo(() => {
    const symbols = filter === "favorites" ? settings.favorites : allSymbols;
    // pinned favorites on top when viewing all
    if (filter === "all") {
      const favSet = new Set(settings.favorites);
      const pinned = allSymbols.filter((s) => favSet.has(s));
      const rest = allSymbols.filter((s) => !favSet.has(s));
      return [...pinned, ...rest];
    }
    return symbols;
  }, [filter, allSymbols, settings.favorites]);

  const isLoading = store.isLoadingPairs || store.isLoadingTickers;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("title")}</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Real-time prices from Binance
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--card-border)]"
            }`}
          >
            All Markets
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filter === "favorites"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--card-border)]"
            }`}
          >
            <span>★</span>
            <span>Watchlist</span>
            {settings.favorites.length > 0 && (
              <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {settings.favorites.length}
              </span>
            )}
          </button>
        </div>

        {/* Market table */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
          {store.error ? (
            <div className="p-8 text-center text-[var(--red)]">{t("error")}</div>
          ) : isLoading ? (
            <div className="p-4">
              <MarketTableSkeleton />
            </div>
          ) : displaySymbols.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              {filter === "favorites" ? "No favorites yet. Star pairs to add them here." : t("noResults")}
            </div>
          ) : (
            <MarketTable
              symbols={displaySymbols}
              favorites={settings.favorites}
            />
          )}
        </div>

        {/* Stats bar */}
        {!isLoading && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)] text-right">
            {store.tickers.size} trading pairs · Live via Binance WebSocket
          </p>
        )}
      </main>

      <ToastContainer />
    </div>
  );
});

export default function Home() {
  return (
    <ErrorBoundary>
      <DashboardPage />
    </ErrorBoundary>
  );
}
