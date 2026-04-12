"use client";

import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getMarketStore } from "@/stores/market/marketStore";

function formatDepthPrice(price: number): string {
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export const OrderBook = observer(function OrderBook() {
  const t = useTranslations("detail");
  const store = getMarketStore();
  const book = store.orderBook;

  if (!book) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const maxTotal = Math.max(
    ...book.asks.map((a) => a.total),
    ...book.bids.map((b) => b.total)
  );

  return (
    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
      {/* Asks (sell orders) */}
      <div>
        <div className="grid grid-cols-3 gap-1 text-[var(--muted-foreground)] mb-1 px-1">
          <span>{t("price")}</span>
          <span className="text-right">{t("amount")}</span>
          <span className="text-right">{t("total")}</span>
        </div>
        {book.asks.slice(0, 12).map((ask, i) => (
          <div key={i} className="relative">
            <div
              className="absolute right-0 top-0 h-full opacity-20 bg-[var(--red)]"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <div className="relative grid grid-cols-3 gap-1 px-1 py-0.5 hover:bg-[var(--card-border)]/30">
              <span className="text-[var(--red)]">{formatDepthPrice(ask.price)}</span>
              <span className="text-right text-[var(--foreground)]">{ask.quantity.toFixed(4)}</span>
              <span className="text-right text-[var(--muted-foreground)]">{ask.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bids (buy orders) */}
      <div>
        <div className="grid grid-cols-3 gap-1 text-[var(--muted-foreground)] mb-1 px-1">
          <span>{t("price")}</span>
          <span className="text-right">{t("amount")}</span>
          <span className="text-right">{t("total")}</span>
        </div>
        {book.bids.slice(0, 12).map((bid, i) => (
          <div key={i} className="relative">
            <div
              className="absolute left-0 top-0 h-full opacity-20 bg-[var(--green)]"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <div className="relative grid grid-cols-3 gap-1 px-1 py-0.5 hover:bg-[var(--card-border)]/30">
              <span className="text-[var(--green)]">{formatDepthPrice(bid.price)}</span>
              <span className="text-right text-[var(--foreground)]">{bid.quantity.toFixed(4)}</span>
              <span className="text-right text-[var(--muted-foreground)]">{bid.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
