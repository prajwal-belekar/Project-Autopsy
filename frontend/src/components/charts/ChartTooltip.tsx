interface TipEntry {
  name?: string | number;
  value?: string | number;
  color?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: TipEntry[];
  label?: string | number;
  valueFormatter?: (v: string | number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="min-w-36 rounded-md border border-edge bg-raised px-3 py-2 text-xs shadow-xl">
      {label !== undefined && label !== '' && (
        <div className="mb-1 font-mono text-2xs text-faint">{String(label)}</div>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span aria-hidden className="inline-block size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: p.color }} />
            <span className="text-dim">{p.name}</span>
            <span className="ml-auto pl-3 font-mono tabular-nums text-ink">
              {valueFormatter ? valueFormatter(p.value ?? '') : String(p.value ?? '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5 text-2xs text-dim">
          <span
            aria-hidden
            className="inline-block w-3.5"
            style={{ borderTop: it.dashed ? `2px dashed ${it.color}` : `2px solid ${it.color}` }}
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
