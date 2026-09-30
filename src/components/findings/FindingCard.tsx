import { Link, useParams } from 'react-router-dom';
import { ArrowRight, FileSearch } from 'lucide-react';
import { SeverityBadge } from '../common/Badge';
import { CollapsibleSection } from '../common/Collapsible';
import type { Finding } from '../../types';

/**
 * Uniform finding structure: Finding → Evidence → Impact → Recommendation,
 * with an optional, clearly-labeled AI interpretation layer.
 */
export function FindingCard({ finding }: { finding: Finding }) {
  const { repoId = '' } = useParams();
  return (
    <article id={finding.id} className="scroll-mt-20 rounded-lg border border-edge bg-surface">
      <div className="border-b border-edge-soft px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          <span className="font-mono text-2xs uppercase tracking-wider text-faint">{finding.area}</span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-semibold text-ink">{finding.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-dim">{finding.observation}</p>
      </div>

      <div className="grid gap-5 px-4 py-3.5 md:grid-cols-2">
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-faint">Evidence</h4>
          <ul className="mt-2 space-y-1">
            {finding.evidence.map((e, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-dim">
                <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-faint" />
                {e}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wider text-faint">Impact</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-dim">{finding.impact}</p>
          </div>
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wider text-faint">Recommendation</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-dim">{finding.recommendation}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-edge-soft px-4 py-2.5">
        <Link
          to={`/repository/${repoId}/${finding.evidenceLink.to}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-opacity hover:opacity-80"
        >
          <FileSearch aria-hidden className="size-3.5" />
          {finding.evidenceLink.label}
          <ArrowRight aria-hidden className="size-3" />
        </Link>
        {finding.aiInterpretation && (
          <CollapsibleSection title="AI Interpretation">
            <div className="rounded-md border border-note/30 bg-note/5 p-3">
              <div className="mb-2 flex flex-wrap items-center gap-1.5 text-2xs font-medium">
                <span className="rounded border border-edge bg-raised px-1.5 py-0.5 text-dim">Evidence</span>
                <ArrowRight aria-hidden className="size-3 text-faint" />
                <span className="rounded border border-edge bg-raised px-1.5 py-0.5 text-dim">
                  Deterministic Analysis
                </span>
                <ArrowRight aria-hidden className="size-3 text-faint" />
                <span className="rounded border border-note/40 bg-note/10 px-1.5 py-0.5 text-note">
                  AI Interpretation
                </span>
              </div>
              <p className="text-xs leading-relaxed text-dim">{finding.aiInterpretation.text}</p>
              <p className="mt-2 text-2xs leading-relaxed text-faint">{finding.aiInterpretation.disclaimer}</p>
            </div>
          </CollapsibleSection>
        )}
      </div>
    </article>
  );
}
