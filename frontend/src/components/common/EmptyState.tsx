import type { ReactNode } from 'react';

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-[14px] font-medium text-dim">{title}</p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-faint">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
