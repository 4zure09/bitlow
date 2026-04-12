"use client";

import { useEffect, useRef } from "react";
import { reaction } from "mobx";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type UTCTimestamp,
  CandlestickSeries,
} from "lightweight-charts";
import { getMarketStore } from "@/stores/market/marketStore";
import type { CandleData } from "@/types/market";

function toChartCandle(c: CandleData) {
  return {
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  };
}

interface CandlestickChartProps {
  symbol: string;
}

export function CandlestickChart({ symbol }: CandlestickChartProps) {
  const store = getMarketStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Init chart on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#a0aec0",
      },
      grid: {
        vertLines: { color: "#2d3748" },
        horzLines: { color: "#2d3748" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#2d3748" },
      timeScale: {
        borderColor: "#2d3748",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 400,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#48bb78",
      downColor: "#fc8181",
      borderUpColor: "#48bb78",
      borderDownColor: "#fc8181",
      wickUpColor: "#48bb78",
      wickDownColor: "#fc8181",
    } as Partial<CandlestickSeriesOptions>);

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // MobX reaction: full dataset replacement when first-candle-time changes
  useEffect(() => {
    const store = getMarketStore();
    let prevFirstTime: number | null = null;

    const dispose = reaction(
      () => ({
        firstTime: store.candles.length > 0 ? store.candles[0].time : null,
        length: store.candles.length,
      }),
      ({ firstTime, length }) => {
        const series = seriesRef.current;
        if (!series || length === 0 || firstTime === null) return;

        if (firstTime !== prevFirstTime) {
          // New dataset loaded
          prevFirstTime = firstTime;
          series.setData(store.candles.map(toChartCandle));
          chartRef.current?.timeScale().fitContent();
        }
      },
      { fireImmediately: true }
    );

    return dispose;
  }, []);

  // MobX reaction: live update for last candle only
  useEffect(() => {
    const store = getMarketStore();

    const dispose = reaction(
      () => {
        const candles = store.candles;
        if (candles.length === 0) return null;
        const last = candles[candles.length - 1];
        return { time: last.time, close: last.close, high: last.high, low: last.low };
      },
      (lastSnap) => {
        const series = seriesRef.current;
        const candles = store.candles;
        if (!series || !lastSnap || candles.length === 0) return;
        const last = candles[candles.length - 1];
        series.update(toChartCandle(last));
      }
    );

    return dispose;
  }, []);

  if (store.isLoadingCandles) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
