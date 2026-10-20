import { cn } from '../../utils/cn';
import { InfoTip } from './InfoTip';
import { Chip } from './Badge';
import type { ChipTone } from '../../utils/severity';
import { toneHex } from '../../utils/severity';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* Metric tiles / rows                                                 */
/* ------------------------------------------------------------------ */

export interface MetricItem {
  label: string;
  value: ReactNode;
  sub?: string;
  hint?: ReactNode;
}

export function MetricTile({ label, value, sub, hint }: MetricItem) {
  return (
    <div className="min-w-0 rounded-md border border-edge-soft bg-surface px-3 py-2.5">
      <div className="flex items-center gap-1">
        <dt className="truncate text-xs text-faint">{label}</dt>
        {hint && <InfoTip label={`About ${label}`}>{hint}</InfoTip>}
      </div>
      <dd className="mt-1 truncate text-[20px] font-semibold leading-tight tabular-nums text-ink">
        {value}
      </dd>
      {sub && <p className="mt-0.5 truncate text-2xs text-faint">{sub}</p>}
    </div>
  );
}

const GRID_COLS: Record<number, string> = {
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export function MetricRow({ items, cols = 6 }: { items: MetricItem[]; cols?: 3 | 4 | 5 | 6 }) {
  return (
    <dl className={cn('grid grid-cols-2 gap-2', GRID_COLS[cols] ?? GRID_COLS[6])}>
      {items.map((m) => (
        <MetricTile key={m.label} {...m} />
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal score bar (health metrics etc.)                          */
/* ------------------------------------------------------------------ */

export interface ScoreBarItem {
  label: string;
  value: number;
  hint?: string;
  statusLabel?: string;
  statusTone?: ChipTone;
  /** ChipTone driving the bar color; defaults to health coloring of the score. */
  tone?: ChipTone;
}

export function ScoreBarRow({ label, value, hint, statusLabel, statusTone, tone }: ScoreBarItem) {
  const color = tone ? toneHex[tone] : toneHex[healthTone(value)];
  return (
    <li className="flex items-center gap-2 py-[7px] sm:gap-3">
      <span className="w-32 shrink-0 truncate text-13 text-dim sm:w-44">{label}</span>
      {hint && <InfoTip label={`How ${label} is scored`}>{hint}</InfoTip>}
      <div
        className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-edge-soft"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-7 shrink-0 text-right font-mono text-13 tabular-nums text-ink">{value}</span>
      {statusLabel && (
        <Chip tone={statusTone} dot={false} className="w-20 justify-center sm:w-24">
          {statusLabel}
        </Chip>
      )}
    </li>
  );
}

function healthTone(score: number): ChipTone {
  if (score >= 75) return 'ok';
  if (score >= 60) return 'warn';
  if (score >= 45) return 'high';
  return 'crit';
}
