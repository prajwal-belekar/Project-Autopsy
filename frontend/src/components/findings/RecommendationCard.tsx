import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PriorityChip } from '../common/Badge';
import type { Recommendation } from '../../types';

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const { repoId = '' } = useParams();
  return (
    <article className="rounded-lg border border-edge bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <PriorityChip p={rec.priority} />
        <span className="text-2xs text-faint">{rec.priorityLabel}</span>
      </div>
      <h3 className="mt-2 text-[14px] font-semibold text-ink">{rec.issue}</h3>
      <div className="mt-3 grid gap-4 text-xs leading-relaxed md:grid-cols-3">
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-faint">Evidence</h4>
          <ul className="mt-1.5 space-y-1 text-dim">
            {rec.evidence.map((e, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-faint" />
                {e}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-faint">Action</h4>
          <p className="mt-1.5 text-dim">{rec.action}</p>
        </div>
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-faint">
            Expected Engineering Benefit
          </h4>
          <p className="mt-1.5 text-dim">{rec.benefit}</p>
        </div>
      </div>
      {rec.findingId && (
        <Link
          to={`/repository/${repoId}/findings#${rec.findingId}`}
          className="mt-3 inline-flex items-center gap-1 text-2xs font-medium text-accent transition-opacity hover:opacity-80"
        >
          Linked finding <ArrowRight aria-hidden className="size-3" />
        </Link>
      )}
    </article>
  );
}
