"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getMarketStore } from "@/stores/market/marketStore";
import type { TradingPair } from "@/types/market";

const MAX_SUGGESTIONS = 8;

interface SuggestionItemProps {
  pair: TradingPair;
  isHighlighted: boolean;
  onClick: () => void;
}

const SuggestionItem = memo(function SuggestionItem({
  pair,
  isHighlighted,
  onClick,
}: SuggestionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
        isHighlighted
          ? "bg-[var(--accent)] text-white"
          : "hover:bg-[var(--card-border)] text-[var(--foreground)]"
      }`}
    >
      <span className="font-mono font-medium">{pair.baseAsset}</span>
      <span className="text-[var(--muted-foreground)] text-sm">/ {pair.quoteAsset}</span>
      <span className={`ml-auto text-xs ${isHighlighted ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>
        {pair.symbol}
      </span>
    </button>
  );
});

export const SearchBar = observer(function SearchBar() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const store = getMarketStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions: TradingPair[] = query.trim().length === 0
    ? []
    : store.pairs
        .filter(
          (p) =>
            p.symbol.includes(query.toUpperCase()) ||
            p.baseAsset.includes(query.toUpperCase())
        )
        .slice(0, MAX_SUGGESTIONS);

  const navigate = useCallback(
    (symbol: string) => {
      setQuery("");
      setOpen(false);
      router.push(`/${symbol}`);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(suggestions[highlighted].symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={t("search")}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-2xl overflow-hidden z-50">
          {suggestions.map((pair, i) => (
            <SuggestionItem
              key={pair.symbol}
              pair={pair}
              isHighlighted={i === highlighted}
              onClick={() => navigate(pair.symbol)}
            />
          ))}
        </div>
      )}
    </div>
  );
});
