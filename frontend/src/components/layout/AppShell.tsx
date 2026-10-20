import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRepository } from '../../hooks/useQueries';
import { useUIStore } from '../../stores/uiStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandSearch } from '../navigation/CommandSearch';

export function AppShell() {
  const { repoId = '' } = useParams();
  const { data: repo, isLoading, isError } = useRepository(repoId);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useUIStore.getState().setSearchOpen(true);
      }
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSidebarOpen]);

  if (isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-edge bg-surface p-6 text-center">
          <h1 className="text-[15px] font-semibold text-ink">The repository could not be accessed.</h1>
          <p className="mt-2 text-xs leading-relaxed text-faint">
            No analysis is available for “{repoId}”. Verify the repository URL and access permissions, then try
            again.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              to="/analyze"
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
            >
              Analyze a repository
            </Link>
            <Link
              to="/"
              className="rounded-md border border-edge px-3 py-1.5 text-xs font-medium text-dim transition-colors hover:text-ink"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <Header repo={repo} />
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <Sidebar repoId={repoId} repoName={repo?.name} branch={repo?.branch} />
        </div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            >
              <motion.div
                initial={reduce ? false : { x: -260 }}
                animate={{ x: 0 }}
                exit={reduce ? undefined : { x: -260 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full w-60"
                onClick={(e) => e.stopPropagation()}
              >
                <Sidebar
                  repoId={repoId}
                  repoName={repo?.name}
                  branch={repo?.branch}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-5 lg:px-6">
            {isLoading ? (
              <div className="space-y-4" role="status" aria-label="Loading repository">
                <div className="h-7 w-64 animate-pulse rounded bg-raised" />
                <div className="h-[72px] w-full animate-pulse rounded bg-raised" />
                <div className="h-96 w-full animate-pulse rounded bg-raised" />
              </div>
            ) : (
              <motion.div
                key={location.pathname}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Outlet context={{ repository: repo }} />
              </motion.div>
            )}
          </div>
        </main>
      </div>
      <CommandSearch />
    </div>
  );
}
