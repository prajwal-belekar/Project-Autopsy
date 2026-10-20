import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { GitBranch, Menu, RefreshCw, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Repository } from '../../types';
import { relTime } from '../../utils/format';
import { useUIStore } from '../../stores/uiStore';
import { ExportMenu } from './ExportMenu';

export function Header({ repo }: { repo?: Repository }) {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const queryClient = useQueryClient();
  const fetching = useIsFetching();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-edge bg-panel px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setSidebarOpen(true)}
          className="rounded-md border border-edge-soft p-1.5 text-dim transition-colors hover:text-ink lg:hidden"
        >
          <Menu aria-hidden className="size-4" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-semibold text-ink">{repo?.name ?? '…'}</span>
            {repo && (
              <span className="hidden items-center gap-1 rounded border border-edge-soft bg-surface px-1.5 py-0.5 font-mono text-2xs text-dim sm:inline-flex">
                <GitBranch aria-hidden className="size-3" />
                {repo.branch}
              </span>
            )}
          </div>
          <p className="truncate font-mono text-2xs text-faint">{repo?.url ?? ''}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-8 w-52 items-center gap-2 rounded-md border border-edge bg-surface px-2.5 text-xs text-faint transition-colors hover:text-dim md:flex"
        >
          <Search aria-hidden className="size-3.5" />
          Search repository...
          <kbd className="ml-auto rounded border border-edge-soft bg-panel px-1 font-mono text-[10px]">⌘K</kbd>
        </button>
        <button
          type="button"
          aria-label="Search repository"
          onClick={() => setSearchOpen(true)}
          className="rounded-md border border-edge-soft p-1.5 text-dim transition-colors hover:text-ink md:hidden"
        >
          <Search aria-hidden className="size-4" />
        </button>

        {repo && (
          <div className="hidden items-center gap-3 xl:flex">
            <span className="whitespace-nowrap text-2xs text-faint">
              Last analyzed: {relTime(repo.lastAnalyzedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-2xs text-ok">
              <span aria-hidden className="size-1.5 rounded-full bg-ok" />
              {repo.analysisStatus === 'complete' ? 'Analysis complete' : 'Partial analysis'}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => queryClient.invalidateQueries()}
          disabled={fetching > 0}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-edge bg-surface px-2.5 text-xs font-medium text-dim transition-colors hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw aria-hidden className={cn('size-3.5', fetching > 0 && 'animate-spin')} />
          Re-analyze
        </button>
        <ExportMenu />
      </div>
    </header>
  );
}
