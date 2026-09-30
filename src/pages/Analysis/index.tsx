import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Circle, Loader2, X } from 'lucide-react';
import { BareHeader } from '../../components/layout/BareHeader';
import { useAnalysisStatus } from '../../hooks/useQueries';
import type { AnalysisStepStatus } from '../../types';
import { cn } from '../../utils/cn';

const STATUS_LABEL: Record<AnalysisStepStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

/**
 * Analysis job tracking (/analysis/:analysisId). Polls the service layer for
 * step status — Pending / Running / Completed / Failed — and, on completion,
 * resolves the repository id and opens the repository workspace. No fake
 * percentage progress: statuses come from the job record only.
 */
export default function Analysis() {
  const { analysisId = '' } = useParams();
  const navigate = useNavigate();
  const { data: job, isError, error } = useAnalysisStatus(analysisId);

  const completed = job?.status === 'completed';

  useEffect(() => {
    document.title = 'Analysis · Project Autopsy';
  }, []);

  useEffect(() => {
    if (!completed || !job?.repositoryId) return;
    const t = window.setTimeout(() => navigate(`/repository/${job.repositoryId}`), 1100);
    return () => window.clearTimeout(t);
  }, [completed, job?.repositoryId, navigate]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <BareHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6">
        {isError && (
          <div className="rounded-lg border border-crit/40 bg-crit/10 p-4" role="alert">
            <div className="flex gap-2.5">
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-crit" />
              <div>
                <h1 className="text-[15px] font-semibold text-crit">
                  The analysis job could not be found.
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-dim">
                  {error instanceof Error ? error.message : 'No analysis state is available for this id.'}{' '}
                  In the demo environment analysis jobs are held in memory only.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                to="/analyze"
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
              >
                Start a new analysis
              </Link>
              <Link
                to="/"
                className="rounded-md border border-edge px-3 py-1.5 text-xs font-medium text-dim transition-colors hover:text-ink"
              >
                Go home
              </Link>
            </div>
          </div>
        )}

        {!isError && (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-[22px] font-semibold tracking-tight text-ink">Analysis</h1>
              <span className="font-mono text-2xs text-faint">{analysisId}</span>
            </div>
            <p className="mt-1.5 break-all font-mono text-xs text-dim">{job?.url ?? '…'}</p>

            <div
              className="mt-6 rounded-lg border border-edge bg-surface p-4"
              aria-live="polite"
              aria-label="Analysis progress"
            >
              <p className="mb-3 flex items-center justify-between text-2xs font-medium uppercase tracking-wider text-faint">
                <span>
                  {job?.status === 'queued' && 'Queued'}
                  {job?.status === 'running' && 'Analyzing repository'}
                  {completed && 'Analysis complete'}
                </span>
                {!completed && !isError && (
                  <Loader2 aria-hidden className="size-3.5 animate-spin text-accent" />
                )}
              </p>
              <ol className="space-y-2.5">
                {(job?.steps ?? []).map((s) => (
                  <li key={s.key} className="flex items-center gap-2.5 text-13">
                    {s.status === 'completed' ? (
                      <Check aria-hidden className="size-3.5 text-ok" />
                    ) : s.status === 'running' ? (
                      <Loader2 aria-hidden className="size-3.5 animate-spin text-accent" />
                    ) : s.status === 'failed' ? (
                      <X aria-hidden className="size-3.5 text-crit" />
                    ) : (
                      <Circle aria-hidden className="size-3.5 text-faint" />
                    )}
                    <span
                      className={cn(
                        s.status === 'completed' && 'text-dim',
                        s.status === 'running' && 'text-ink',
                        s.status === 'pending' && 'text-faint',
                        s.status === 'failed' && 'text-crit',
                      )}
                    >
                      {s.name}
                    </span>
                    <span
                      className={cn(
                        'ml-auto text-2xs',
                        s.status === 'completed' && 'text-ok',
                        s.status === 'running' && 'text-accent',
                        s.status === 'pending' && 'text-faint',
                        s.status === 'failed' && 'text-crit',
                      )}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </li>
                ))}
              </ol>

              {job?.error && (
                <div role="alert" className="mt-4 flex gap-2.5 rounded-md border border-crit/40 bg-crit/10 p-3">
                  <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-crit" />
                  <p className="text-xs leading-relaxed text-dim">{job.error}</p>
                </div>
              )}

              {completed && job.repositoryId && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-edge-soft pt-3">
                  <p className="text-xs text-dim">
                    Repository workspace ready — opening{' '}
                    <span className="font-mono text-ink">{job.repositoryId}</span>…
                  </p>
                  <Link
                    to={`/repository/${job.repositoryId}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
                  >
                    Open repository workspace <ArrowRight aria-hidden className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <p className="mt-6 text-2xs leading-relaxed text-faint">
              Step states are reported by the analysis service. No synthetic progress percentages are
              shown.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
