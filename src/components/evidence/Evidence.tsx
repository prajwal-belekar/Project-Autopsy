import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import type { Severity } from '../../types';

/* ------------------------------------------------------------------ */
/* Evidence list — label/value pairs backing a finding                 */
/* ------------------------------------------------------------------ */

export interface EvidenceItem {
  label: string;
  value: string;
  tone?: 'neutral' | Severity;
}

const TONE_TEXT: Record<Exclude<EvidenceItem['tone'], undefined | 'neutral'>, string> = {
  critical: 'text-crit',
  high: 'text-high',
  medium: 'text-warn',
  low: 'text-ok',
  informational: 'text-accent',
};

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  return (
    <ul className="divide-y divide-edge-soft/60">
      {items.map((it) => (
        <li key={it.label} className="flex items-baseline justify-between gap-4 py-[5px]">
          <span className="text-13 text-dim">{it.label}</span>
          <span
            className={cn(
              'shrink-0 font-mono text-13 tabular-nums',
              !it.tone || it.tone === 'neutral' ? 'text-ink' : TONE_TEXT[it.tone],
            )}
          >
            {it.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Methodology / signal disclaimer notes                               */
/* ------------------------------------------------------------------ */

export function SignalNote({ children }: { children: ReactNode }) {
  return <p className="border-l-2 border-edge-soft pl-2.5 text-2xs leading-relaxed text-faint">{children}</p>;
}

export function WeightsTable({
  weights,
  note,
}: {
  weights: { factor: string; pct: number }[];
  note?: string;
}) {
  const max = Math.max(...weights.map((w) => w.pct), 1);
  return (
    <div className="space-y-3">
      <ul className="space-y-1.5">
        {weights.map((w) => (
          <li key={w.factor} className="flex items-center gap-3 text-xs">
            <span className="w-36 shrink-0 text-dim sm:w-44">{w.factor}</span>
            <div className="h-1.5 min-w-6 flex-1 overflow-hidden rounded-full bg-edge-soft">
              <div className="h-full rounded-full bg-accent/70" style={{ width: `${(w.pct / max) * 100}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right font-mono tabular-nums text-ink">{w.pct}%</span>
          </li>
        ))}
      </ul>
      {note && <SignalNote>{note}</SignalNote>}
    </div>
  );
}
