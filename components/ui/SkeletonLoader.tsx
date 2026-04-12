"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--card-border)] ${className}`}
    />
  );
}

export function MarketTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)]"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28 ml-auto" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--card)] rounded-lg">
      <div className="space-y-3 w-full px-6">
        <Skeleton className="h-48 w-full" />
        <div className="flex gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 flex-1" />
          ))}
        </div>
      </div>
    </div>
  );
}
