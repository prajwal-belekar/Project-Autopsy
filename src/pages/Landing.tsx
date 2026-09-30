import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fmtInt } from '../utils/format';
import { hotspots } from '../mock/hotspots';
import { debt } from '../mock/debt';
import { health } from '../mock/health';
import { repository, sampleRepositoryRoute } from '../mock/repository';

const CHAIN = ['Observation', 'Metric', 'Correlation', 'Finding', 'Recommendation'];

const EXAMINES: { name: string; desc: string }[] = [
  { name: 'Code Health', desc: 'Complexity, maintainability, coupling, and duplication from static analysis.' },
  { name: 'Git Forensics', desc: 'Commit activity, churn, reverts, and repository history.' },
  { name: 'Development Friction', desc: 'A composite friction signal built from observable activity patterns.' },
  { name: 'Hotspots', desc: 'Files combining high complexity with high change frequency.' },
  { name: 'Architecture', desc: 'Module structure, dependency direction, and circular dependencies.' },
  { name: 'Technical Debt', desc: 'TODO/FIXME/HACK markers, duplication, and deprecated usage.' },
  { name: 'Testing', desc: 'Test structure, activity over time, and untested risk.' },
  { name: 'Documentation', desc: 'Presence and completeness of repository documentation.' },
  { name: 'Issues & PRs', desc: 'Trends in issue and pull-request activity.' },
  { name: 'Evolution', desc: 'A chronological timeline of how the repository changed.' },
  { name: 'Findings', desc: 'Evidence-backed conclusions with prioritized recommendations.' },
];

const SAMPLE_METRICS: { label: string; value: string }[] = [
  { label: 'Health score', value: `${health.overall} / 100` },
  { label: 'Files', value: fmtInt(repository.files) },
  { label: 'Lines of code', value: fmtInt(repository.linesOfCode) },
  { label: 'Commits', value: fmtInt(repository.commits) },
  { label: 'Hotspots', value: String(hotspots.filter((h) => h.risk >= 60).length) },
  { label: 'Debt markers', value: String(debt.counts.todo + debt.counts.fixme + debt.counts.hack) },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-edge-soft">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="7" fill="#151B23" stroke="#27313D" />
              <circle cx="16" cy="16" r="8.5" fill="none" stroke="#22D3EE" strokeWidth="2.5" />
              <line x1="16" y1="10.5" x2="16" y2="21.5" stroke="#22D3EE" strokeWidth="2.5" />
            </svg>
            <span className="text-[13px] font-semibold tracking-[0.14em] text-ink">PROJECT AUTOPSY</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={sampleRepositoryRoute}
              className="rounded-md border border-edge px-3 py-1.5 text-xs font-medium text-dim transition-colors hover:text-ink"
            >
              Sample analysis
            </Link>
            <Link
              to="/analyze"
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
            >
              Analyze a repository
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 sm:py-20">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-accent">
            Repository engineering intelligence
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-[44px]">
            Understand how your codebase evolved, where complexity accumulated, and what requires
            attention.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-dim">
            Project Autopsy analyzes a software repository using source-code analysis, Git history,
            structural analysis, testing signals, technical-debt indicators, and repository activity —
            and presents the results as an evidence-driven engineering investigation.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-canvas transition-opacity hover:opacity-90"
            >
              Analyze a repository <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              to={sampleRepositoryRoute}
              className="inline-flex items-center gap-2 rounded-md border border-edge px-4 py-2 text-[13px] font-medium text-dim transition-colors hover:border-accent/40 hover:text-ink"
            >
              View sample analysis
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Analysis hierarchy">
            {CHAIN.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded border border-edge-soft bg-surface px-2 py-1 font-mono text-2xs uppercase tracking-wider text-dim">
                  {step}
                </span>
                {i < CHAIN.length - 1 && <ArrowRight aria-hidden className="size-3 text-faint" />}
              </span>
            ))}
          </div>
        </section>

        {/* Three questions */}
        <section className="border-t border-edge-soft py-12">
          <h2 className="text-[17px] font-semibold text-ink">Every screen answers three questions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['What is happening in the repository?', 'Activity, churn, and change patterns reconstructed from Git metadata.'],
              ['Where are the highest-risk areas?', 'Hotspots ranked by combined complexity, churn, and defect-fix signals.'],
              ['What evidence supports each finding?', 'Every conclusion links back to commits, metrics, and debt markers.'],
            ].map(([q, a]) => (
              <div key={q} className="rounded-lg border border-edge bg-surface p-4">
                <p className="text-[14px] font-medium text-ink">{q}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-faint">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What it examines */}
        <section className="border-t border-edge-soft py-12">
          <h2 className="text-[17px] font-semibold text-ink">What the analysis examines</h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-faint">
            Twelve analytical modules, all driven by deterministic signals. AI is used only as a
            secondary interpretation layer and never invents metrics.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMINES.map((m) => (
              <div key={m.name} className="rounded-lg border border-edge-soft bg-surface p-4">
                <p className="text-13 font-medium text-ink">{m.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-faint">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample */}
        <section className="border-t border-edge-soft py-12">
          <div className="rounded-lg border border-edge bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge-soft px-4 py-3">
              <div>
                <h2 className="text-[14px] font-semibold text-ink">Sample analysis</h2>
                <p className="mt-0.5 font-mono text-2xs text-faint">{repository.url}</p>
              </div>
              <Link
                to={sampleRepositoryRoute}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-opacity hover:opacity-80"
              >
                Open full analysis <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-6">
              {SAMPLE_METRICS.map((m) => (
                <div key={m.label} className="rounded-md border border-edge-soft bg-panel px-3 py-2.5">
                  <dt className="text-xs text-faint">{m.label}</dt>
                  <dd className="mt-1 text-[18px] font-semibold tabular-nums text-ink">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-edge-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-2xs text-faint sm:px-6">
          <span>Project Autopsy — evidence-driven engineering investigation.</span>
          <span>Deterministic analysis first. AI only interprets. Every finding links to evidence.</span>
        </div>
      </footer>
    </div>
  );
}
