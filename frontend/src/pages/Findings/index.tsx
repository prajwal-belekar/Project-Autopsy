import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { PageSkeleton } from '../../components/common/Skeleton';
import { PriorityChip } from '../../components/common/Badge';
import { SelectFilter } from '../../components/common/Filters';
import { SignalNote } from '../../components/evidence/Evidence';
import { FindingCard } from '../../components/findings/FindingCard';
import { RecommendationCard } from '../../components/findings/RecommendationCard';
import { useFindings, useRecommendations } from '../../hooks/useQueries';
import type { Recommendation } from '../../types';

export default function Findings() {
  const { repoId = '' } = useParams();
  const { data, isLoading } = useFindings(repoId);
  const recommendations = useRecommendations(repoId);
  const [severity, setSeverity] = useState('all');
  const location = useLocation();

  useEffect(() => {
    if (!location.hash || !data) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }, [location.hash, data]);

  const filtered = useMemo(
    () => (data ?? []).filter((f) => severity === 'all' || f.severity === severity),
    [data, severity],
  );

  if (isLoading || !data) return <PageSkeleton />;

  const recs = recommendations.data ?? [];
  const byPriority = (p: Recommendation['priority']) => recs.filter((r) => r.priority === p);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Engineering Findings"
        meta={
          <span>
            Evidence-backed conclusions and recommendations. Severity describes repository risk — not
            people.
          </span>
        }
        actions={
          <SelectFilter
            label="Severity"
            value={severity}
            onChange={setSeverity}
            options={[
              { value: 'all', label: 'All' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
              { value: 'informational', label: 'Informational' },
            ]}
          />
        }
      />

      <div className="space-y-3">
        {filtered.map((f) => (
          <FindingCard key={f.id} finding={f} />
        ))}
        {filtered.length === 0 && (
          <Panel>
            <p className="py-8 text-center text-xs text-faint">No findings at this severity.</p>
          </Panel>
        )}
      </div>

      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">Recommended Actions</h2>
          <span className="text-2xs text-faint">Connected directly to the findings above</span>
        </div>
        {(['P0', 'P1', 'P2'] as const).map((p) => {
          const group = byPriority(p);
          if (group.length === 0) return null;
          return (
            <div key={p} className="space-y-2">
              <div className="flex items-center gap-2">
                <PriorityChip p={p} />
                <span className="text-xs text-faint">{group[0].priorityLabel}</span>
              </div>
              {group.map((r) => (
                <RecommendationCard key={r.id} rec={r} />
              ))}
            </div>
          );
        })}
      </section>

      <SignalNote>
        Findings follow a fixed hierarchy: observation → metric → correlation → finding →
        recommendation. Every finding exposes a View Evidence action linking to the underlying
        repository signals.
      </SignalNote>
    </div>
  );
}
