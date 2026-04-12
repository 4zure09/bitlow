"use client";

import { memo, useRef, useEffect } from "react";
import Link from "next/link";
import { observer } from "mobx-react-lite";
import { getMarketStore } from "@/stores/market/marketStore";
import { getSettingsStore } from "@/stores/settings/settingsStore";
import { toggleFavorite } from "@/stores/settings/settingsActions";
import type { PriceDirection } from "@/types/market";

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return price.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 8 });
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}

interface MarketRowProps {
  symbol: string;
  isFavorite: boolean;
}

// Each row observes only its own ticker — granular MobX reactivity
const MarketRow = observer(function MarketRow({ symbol, isFavorite }: MarketRowProps) {
  const store = getMarketStore();
  const ticker = store.tickers.get(symbol);
  const flashRef = useRef<HTMLTableRowElement>(null);
  const prevDirectionRef = useRef<PriceDirection>("neutral");

  useEffect(() => {
    if (!ticker) return;
    const direction = ticker.direction;
    if (direction === "neutral" || direction === prevDirectionRef.current) return;
    prevDirectionRef.current = direction;

    const el = flashRef.current;
    if (!el) return;
    el.classList.remove("flash-up", "flash-down");
    // Trigger reflow to restart animation
    void el.offsetHeight;
    el.classList.add(direction === "up" ? "flash-up" : "flash-down");
  }, [ticker?.direction, ticker?.lastUpdated]);

  if (!ticker) return null;

  const isPositive = ticker.priceChangePercent >= 0;

  return (
    <tr
      ref={flashRef}
      className="border-b border-[var(--card-border)] hover:bg-[var(--card-border)]/30 transition-colors cursor-pointer group"
    >
      {/* Favorite */}
      <td className="pl-4 pr-2 py-3 w-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(symbol);
          }}
          className="text-[var(--muted)] hover:text-yellow-400 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </td>

      {/* Symbol */}
      <td className="pr-4 py-3">
        <Link href={`/${symbol}`} className="flex items-center gap-2">
          <div>
            <span className="font-semibold text-[var(--foreground)] font-mono">
              {ticker.symbol.replace("USDT", "")}
            </span>
            <span className="text-[var(--muted-foreground)] text-xs">/USDT</span>
          </div>
        </Link>
      </td>

      {/* Price */}
      <td className="pr-4 py-3">
        <Link href={`/${symbol}`} className="block font-mono font-medium text-[var(--foreground)]">
          ${formatPrice(ticker.price)}
        </Link>
      </td>

      {/* 24h Change */}
      <td className="pr-4 py-3">
        <Link href={`/${symbol}`} className="block">
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-md ${
              isPositive
                ? "text-[var(--green)] bg-[var(--green-bg)]"
                : "text-[var(--red)] bg-[var(--red-bg)]"
            }`}
            style={{
              backgroundColor: isPositive ? "var(--green-bg)" : "var(--red-bg)",
            }}
          >
            {isPositive ? "+" : ""}{ticker.priceChangePercent.toFixed(2)}%
          </span>
        </Link>
      </td>

      {/* Volume */}
      <td className="pr-4 py-3 hidden sm:table-cell">
        <Link href={`/${symbol}`} className="block text-sm text-[var(--muted-foreground)] font-mono">
          {formatVolume(ticker.volume)}
        </Link>
      </td>

      {/* 24h High */}
      <td className="pr-4 py-3 hidden md:table-cell">
        <Link href={`/${symbol}`} className="block text-sm text-[var(--green)] font-mono">
          ${formatPrice(ticker.highPrice)}
        </Link>
      </td>

      {/* 24h Low */}
      <td className="pr-4 py-3 hidden md:table-cell">
        <Link href={`/${symbol}`} className="block text-sm text-[var(--red)] font-mono">
          ${formatPrice(ticker.lowPrice)}
        </Link>
      </td>
    </tr>
  );
});

interface MarketTableProps {
  symbols: string[];
  favorites: string[];
}

export const MarketTable = memo(function MarketTable({ symbols, favorites }: MarketTableProps) {
  const favoriteSet = new Set(favorites);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[var(--muted-foreground)] text-xs uppercase tracking-wider border-b border-[var(--card-border)]">
            <th className="pl-4 pr-2 py-3 w-10" />
            <th className="text-left pr-4 py-3">Symbol</th>
            <th className="text-left pr-4 py-3">Price</th>
            <th className="text-left pr-4 py-3">24h Change</th>
            <th className="text-left pr-4 py-3 hidden sm:table-cell">Volume</th>
            <th className="text-left pr-4 py-3 hidden md:table-cell">24h High</th>
            <th className="text-left pr-4 py-3 hidden md:table-cell">24h Low</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((symbol) => (
            <MarketRow
              key={symbol}
              symbol={symbol}
              isFavorite={favoriteSet.has(symbol)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
