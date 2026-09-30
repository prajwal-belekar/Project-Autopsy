import type { CSSProperties } from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden className={cn('animate-pulse rounded bg-raised', className)} style={style} />;
}

export function ChartSkeleton({ height = 220, label = 'Loading chart' }: { height?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="w-full">
      <Skeleton style={{ height }} className="w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, label = 'Loading table' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-2.5 px-4 py-4">
      <Skeleton className="h-3 w-2/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" style={{ opacity: 1 - i * 0.09 }} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[70px]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-64 rounded-lg xl:col-span-5" />
        <Skeleton className="h-64 rounded-lg xl:col-span-7" />
      </div>
      <Skeleton className="h-72 rounded-lg" />
    </div>
  );
}
