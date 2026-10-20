import { cn } from '../../utils/cn';
import { RANGE_KEYS, type RangeKey } from '../../utils/series';

interface TabBarProps<T extends string> {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}

export function TabBar<T extends string>({ tabs, value, onChange, ariaLabel }: TabBarProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex items-center gap-1 overflow-x-auto border-b border-edge-soft">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-2.5 py-1.5 text-xs font-medium transition-colors',
              active ? 'border-accent text-ink' : 'border-transparent text-faint hover:text-dim',
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function RangeTabs({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
  return (
    <div role="group" aria-label="Date range" className="inline-flex items-center gap-0.5 rounded-md border border-edge-soft bg-panel p-0.5">
      {RANGE_KEYS.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={r === value}
          onClick={() => onChange(r)}
          className={cn(
            'rounded px-1.5 py-1 font-mono text-2xs font-medium transition-colors',
            r === value ? 'bg-raised text-accent' : 'text-faint hover:text-dim',
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
