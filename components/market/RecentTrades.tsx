"use client";

import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import { getMarketStore } from "@/stores/market/marketStore";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export const RecentTrades = observer(function RecentTrades() {
  const t = useTranslations("detail");
  const store = getMarketStore();
  const trades = store.recentTrades;

  return (
    <div className="font-mono text-xs">
      <div className="grid grid-cols-4 gap-2 text-[var(--muted-foreground)] mb-1 px-1">
        <span>{t("price")}</span>
        <span className="text-right">{t("amount")}</span>
        <span className="text-right">{t("side")}</span>
        <span className="text-right">{t("time")}</span>
      </div>
      <div className="space-y-0.5 max-h-80 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="text-center py-4 text-[var(--muted-foreground)]">
            Waiting for trades...
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className={`grid grid-cols-4 gap-2 px-1 py-0.5 hover:bg-[var(--card-border)]/30 ${
                trade.isBuyerMaker ? "text-[var(--red)]" : "text-[var(--green)]"
              }`}
            >
              <span>{trade.price.toFixed(2)}</span>
              <span className="text-right text-[var(--foreground)]">
                {trade.quantity.toFixed(4)}
              </span>
              <span className="text-right text-xs uppercase">
                {trade.isBuyerMaker ? t("sell") : t("buy")}
              </span>
              <span className="text-right text-[var(--muted-foreground)]">
                {formatTime(trade.time)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
