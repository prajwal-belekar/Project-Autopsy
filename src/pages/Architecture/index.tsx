import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { SeverityBadge } from '../../components/common/Badge';
import { SignalNote } from '../../components/evidence/Evidence';
import { DepGraph } from '../../components/charts/DepGraph';
import { useArchitecture } from '../../hooks/useQueries';
import type { CircularDependency, CoupledModule } from '../../types';

export default function Architecture() {
  const { repoId = '' } = useParams();
  const { data, isLoading } = useArchitecture(repoId);

  if (isLoading || !data) return <PageSkeleton />;

  const cycleColumns: Column<CircularDependency>[] = [
    {
      key: 'cycle',
      header: 'Cycle',
      sortValue: (c) => c.cycle.join('|'),
      render: (c) => <span className="font-mono text-xs text-dim">{c.cycle.join(' ↔ ')}</span>,
    },
    { key: 'severity', header: 'Severity', sortValue: (c) => c.severity, render: (c) => <SeverityBadge severity={c.severity} /> },
    { key: 'introduced', header: 'Introduced', sortValue: (c) => c.introduced, render: (c) => <span className="font-mono text-xs text-dim">{c.introduced}</span> },
    { key: 'note', header: 'Note', render: (c) => <span className="text-xs text-faint">{c.note}</span> },
  ];

  const coupledColumns: Column<CoupledModule>[] = [
    { key: 'name', header: 'Module', sortValue: (m) => m.name, render: (m) => <span className="font-mono text-xs text-dim">{m.name}</span> },
    { key: 'fanIn', header: 'Fan-in', align: 'right', sortValue: (m) => m.fanIn, render: (m) => <span className="font-mono tabular-nums text-ink">{m.fanIn}</span> },
    { key: 'fanOut', header: 'Fan-out', align: 'right', sortValue: (m) => m.fanOut, render: (m) => <span className="font-mono tabular-nums text-ink">{m.fanOut}</span> },
    { key: 'risk', header: 'Risk', sortValue: (m) => m.risk, render: (m) => <SeverityBadge severity={m.risk} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Architecture"
        meta={<span>Repository structure and dependency relationships reconstructed from the import graph.</span>}
      />

      <MetricRow
        cols={4}
        items={[
          { label: 'Detected Modules', value: data.sourceModules, hint: 'Source-level modules detected by the import graph analysis.' },
          { label: 'Dependency Relationships', value: data.dependencyEdges, hint: 'File-level import edges across the repository.' },
          { label: 'Circular Dependencies', value: data.circular.length },
          { label: 'Highly Coupled Modules', value: data.highlyCoupled.length },
        ]}
      />

      <Panel title="Module Dependency Graph" subtitle={data.summary}>
        <DepGraph modules={data.graphModules} circular={data.circular} />
        <div className="mt-4 border-t border-edge-soft pt-3">
          <SignalNote>{data.inferenceNote}</SignalNote>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Circular Dependencies" subtitle="Cycles violate the inferred layering and are prioritized in findings." flush>
          <DataTable
            columns={cycleColumns}
            rows={data.circular}
            rowKey={(c) => c.id}
            defaultSort={{ key: 'severity', dir: 'desc' }}
            ariaLabel="Circular dependencies"
            minTableWidth={620}
          />
        </Panel>
        <Panel title="Highly Coupled Modules" subtitle="Modules with the strongest dependency relationships." flush>
          <DataTable
            columns={coupledColumns}
            rows={data.highlyCoupled}
            rowKey={(m) => m.id}
            defaultSort={{ key: 'fanIn', dir: 'desc' }}
            ariaLabel="Highly coupled modules"
            minTableWidth={480}
          />
        </Panel>
      </div>

      <p className="text-2xs leading-relaxed text-faint">
        Nodes represent detected modules; edges represent detected dependencies. Inferred patterns are
        always phrased as consistent-with, never asserted as fact.{' '}
        <Link to={`/repository/${repoId}/findings`} className="text-accent hover:underline">
          Related findings →
        </Link>
      </p>
    </div>
  );
}
