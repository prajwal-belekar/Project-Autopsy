import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { PageSkeleton } from '../../components/common/Skeleton';
import { Chip } from '../../components/common/Badge';
import { SignalNote } from '../../components/evidence/Evidence';
import { useEvolution } from '../../hooks/useQueries';
import { fmtDate, fmtInt, fmtSigned } from '../../utils/format';
import { cn } from '../../utils/cn';

const deltaTone = (delta: number) => (delta > 6 ? 'high' : delta > 0 ? 'warn' : 'ok');

export default function Evolution() {
  const { repoId = '' } = useParams();
  const { data, isLoading } = useEvolution(repoId);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading || !data) return <PageSkeleton />;

  const events = [...data.events].reverse();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Repository Evolution"
        meta={<span>Chronological reconstruction of structural and module-level change.</span>}
      />

      <Panel title="Repository Timeline" subtitle="Each event links to the commits, issues, and pull requests behind it.">
        <ol>
          {events.map((e) => {
            const open = expanded === e.id;
            return (
              <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center pt-2">
                  <span
                    aria-hidden
                    className={cn('size-2 shrink-0 rounded-full', open ? 'bg-accent' : 'bg-edge')}
                  />
                  <span aria-hidden className="mt-0.5 w-px flex-1 bg-edge-soft" />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setExpanded((cur) => (cur === e.id ? null : e.id))}
                    className="w-full rounded-md text-left"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span className="font-mono text-2xs text-faint">{e.month}</span>
                      <span className="text-[14px] font-medium text-ink">{e.title}</span>
                      <span className="font-mono text-2xs text-faint">
                        {fmtInt(e.commits)} commits · {fmtInt(e.filesChanged)} files
                      </span>
                      <ChevronRight
                        aria-hidden
                        className={cn('ml-auto size-3.5 text-faint transition-transform', open && 'rotate-90')}
                      />
                    </div>
                    <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-faint">{e.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Chip tone={deltaTone(e.complexityChange)} dot={false}>
                        complexity {fmtSigned(e.complexityChange)}
                      </Chip>
                      <Chip tone={deltaTone(e.frictionChange)} dot={false}>
                        friction {fmtSigned(e.frictionChange)}
                      </Chip>
                      {e.modules.map((m) => (
                        <Chip key={m} tone="neutral" dot={false}>
                          {m}
                        </Chip>
                      ))}
                    </div>
                  </button>

                  {open && (
                    <div className="mt-2.5 rounded-md border border-edge-soft bg-panel p-3">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
                        {[
                          ['Date', fmtDate(e.date)],
                          ['Commits', fmtInt(e.commits)],
                          ['Files Changed', fmtInt(e.filesChanged)],
                          ['Modules Affected', e.modules.join(', ')],
                          ['Issues', fmtInt(e.issues)],
                          ['Pull Requests', fmtInt(e.prs)],
                          ['Complexity Change', fmtSigned(e.complexityChange)],
                          ['Friction Change', fmtSigned(e.frictionChange)],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <dt className="text-2xs text-faint">{label}</dt>
                            <dd className="mt-0.5 truncate font-mono text-dim" title={String(value)}>
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <Link
                        to={`/repository/${repoId}/${e.evidenceLink.to}`}
                        className="mt-3 inline-flex items-center gap-1 text-2xs font-medium text-accent transition-opacity hover:opacity-80"
                      >
                        {e.evidenceLink.label}
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 border-t border-edge-soft pt-3">
          <SignalNote>{data.note}</SignalNote>
        </div>
      </Panel>
    </div>
  );
}
