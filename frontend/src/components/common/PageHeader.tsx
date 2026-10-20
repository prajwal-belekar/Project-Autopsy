import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({
  title,
  meta,
  actions,
  back,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}) {
  useEffect(() => {
    document.title = `${title} · Project Autopsy`;
  }, [title]);

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        {back && (
          <Link
            to={back.to}
            className="mb-1.5 inline-flex items-center gap-1 text-xs text-faint transition-colors hover:text-accent"
          >
            <ArrowLeft aria-hidden className="size-3" />
            {back.label}
          </Link>
        )}
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">{title}</h1>
        {meta && <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
