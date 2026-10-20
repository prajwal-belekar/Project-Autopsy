import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { Chip } from '../../components/common/Badge';
import { SignalNote } from '../../components/evidence/Evidence';
import { useDocumentationHealth } from '../../hooks/useQueries';
import type { SignalLevel } from '../../types';

const STATUS_LABEL: Record<SignalLevel, string> = {
  available: 'Detected',
  partial: 'Partial',
  none: 'Not detected',
  high: 'Detected',
  moderate: 'Partial',
  medium: 'Partial',
  low: 'Detected',
};

export default function Documentation() {
  const { repoId = '' } = useParams();
  const { data, isLoading } = useDocumentationHealth(repoId);

  if (isLoading || !data) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Documentation"
        meta={<span>Documentation completeness based on detected artifacts — no arbitrary percentages.</span>}
      />

      <Panel title="Documentation Inventory" subtitle="Each artifact is marked Detected, Partial, or Not detected, with the evidence behind the status.">
        <ul className="divide-y divide-edge-soft/60">
          {data.items.map((item) => (
            <li
              key={item.name}
              className="grid gap-1.5 py-2.5 first:pt-0 last:pb-0 md:grid-cols-[220px_130px_minmax(0,1fr)] md:items-baseline md:gap-3"
            >
              <span className="text-13 text-ink">{item.name}</span>
              <span>
                <Chip tone={item.status === 'available' ? 'ok' : item.status === 'partial' ? 'warn' : 'neutral'}>
                  {STATUS_LABEL[item.status]}
                </Chip>
              </span>
              <span className="text-xs leading-relaxed text-faint">{item.evidence}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Inline Documentation" subtitle="Comment coverage measured over exported symbols.">
        <MetricRow cols={3} items={data.inlineStats.map((s) => ({ label: s.label, value: s.value }))} />
      </Panel>

      <SignalNote>{data.note}</SignalNote>
    </div>
  );
}
