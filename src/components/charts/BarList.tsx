import { Link } from 'react-router-dom';

export interface BarListItem {
  label: string;
  sub?: string;
  value: number;
  display?: string;
  color?: string;
  to?: string;
}

/** Ranked horizontal bars for top-N lists (largest files, churn, classification…). */
export function BarList({ items }: { items: BarListItem[] }) {
  if (items.length === 0) return null;
  const max = items.reduce((m, it) => Math.max(m, it.value), 1);
  return (
    <ul className="divide-y divide-edge-soft/50">
      {items.map((it) => (
        <li key={it.label} className="py-2 first:pt-0 last:pb-0">
          <div className="flex items-baseline justify-between gap-3">
            {it.to ? (
              <Link
                to={it.to}
                className="truncate font-mono text-xs text-dim transition-colors hover:text-accent"
                title={it.label}
              >
                {it.label}
              </Link>
            ) : (
              <span className="truncate font-mono text-xs text-dim" title={it.label}>
                {it.label}
              </span>
            )}
            <span className="shrink-0 font-mono text-xs tabular-nums text-ink">{it.display ?? it.value}</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-edge-soft/70">
            <div
              className="h-full rounded-full"
              style={{ width: `${(it.value / max) * 100}%`, backgroundColor: it.color ?? '#22D3EE' }}
            />
          </div>
          {it.sub && <div className="mt-1 text-2xs text-faint">{it.sub}</div>}
        </li>
      ))}
    </ul>
  );
}
