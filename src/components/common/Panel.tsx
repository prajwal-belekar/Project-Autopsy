import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface PanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Remove default body padding (used for tables and charts). */
  flush?: boolean;
}

export function Panel({ title, subtitle, actions, children, className, bodyClassName, flush }: PanelProps) {
  const hasHeader = title !== undefined || actions !== undefined;
  return (
    <section className={cn('rounded-lg border border-edge bg-surface', className)}>
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-edge-soft px-4 py-3">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
            ) : (
              title
            )}
            {subtitle && <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-faint">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(!flush && 'p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
