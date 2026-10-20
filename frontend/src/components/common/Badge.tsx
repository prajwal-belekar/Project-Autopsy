import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import type { Severity, SignalLevel } from '../../types';
import { severityLabel, severityTone, signalLabel, signalTone, type ChipTone } from '../../utils/severity';

const TONES: Record<ChipTone, string> = {
  ok: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  high: 'border-high/30 bg-high/10 text-high',
  crit: 'border-crit/30 bg-crit/10 text-crit',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  note: 'border-note/30 bg-note/10 text-note',
  neutral: 'border-edge bg-raised text-dim',
};

const DOTS: Record<ChipTone, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  high: 'bg-high',
  crit: 'bg-crit',
  accent: 'bg-accent',
  note: 'bg-note',
  neutral: 'bg-faint',
};

/** Small bordered status chip. Never relies on color alone — a dot plus text label. */
export function Chip({
  tone = 'neutral',
  children,
  dot = true,
  className,
}: {
  tone?: ChipTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-1.5 py-0.5 text-2xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', DOTS[tone])} />}
      {children}
    </span>
  );
}

export function SeverityBadge({ severity, label }: { severity: Severity; label?: string }) {
  return <Chip tone={severityTone[severity]}>{label ?? severityLabel[severity]}</Chip>;
}

export function LevelBadge({
  level,
  lowIsBad = false,
  label,
}: {
  level: SignalLevel;
  lowIsBad?: boolean;
  label?: string;
}) {
  return <Chip tone={signalTone(level, lowIsBad)}>{label ?? signalLabel(level)}</Chip>;
}

export function PriorityChip({ p }: { p: 'P0' | 'P1' | 'P2' }) {
  return <Chip tone={p === 'P0' ? 'crit' : p === 'P1' ? 'high' : 'accent'} dot={false}>{p}</Chip>;
}
