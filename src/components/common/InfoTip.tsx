import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Info tooltip. Content appears on hover and on keyboard focus so it is
 * reachable without a pointer.
 */
export function InfoTip({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label ?? 'More information'}
        className="inline-flex text-faint transition-colors hover:text-dim"
      >
        <Info aria-hidden className="size-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full right-0 z-30 mb-1.5 w-64 rounded-md border border-edge bg-raised p-2.5 text-left text-2xs leading-relaxed text-dim opacity-0 shadow-xl transition-opacity duration-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
