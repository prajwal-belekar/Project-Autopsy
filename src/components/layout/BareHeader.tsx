import { Link } from 'react-router-dom';

/**
 * Minimal brand header for pages outside the repository workspace
 * (landing, analyze, analysis tracking).
 */
export function BareHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-edge-soft">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="7" fill="#151B23" stroke="#27313D" />
            <circle cx="16" cy="16" r="8.5" fill="none" stroke="#22D3EE" strokeWidth="2.5" />
            <line x1="16" y1="10.5" x2="16" y2="21.5" stroke="#22D3EE" strokeWidth="2.5" />
          </svg>
          <span className="text-[13px] font-semibold tracking-[0.14em] text-ink">PROJECT AUTOPSY</span>
        </Link>
        {right}
      </div>
    </header>
  );
}
