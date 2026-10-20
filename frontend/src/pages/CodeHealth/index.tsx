import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { InfoTip } from '../../components/common/InfoTip';
import { BarList } from '../../components/charts/BarList';
import { DistributionChart } from '../../components/charts/DistributionChart';
import { useCodeHealth } from '../../hooks/useQueries';
import { fmtInt } from '../../utils/format';
import { severityTone } from '../../utils/severity';
import { Chip } from '../../components/common/Badge';
import type { CodeHealthData } from '../../types';

export default function CodeHealth() {
  const { repoId = '' } = useParams();
  const { data, isLoading } = useCodeHealth(repoId);

  if (isLoading || !data) return <PageSkeleton />;

  const couplingColumns: Column<CodeHealthData['coupling'][number]>[] = [
    { key: 'module', header: 'Module', sortValue: (c) => c.module, render: (c) => <span className="font-mono text-xs text-dim">{c.module}</span> },
    { key: 'fanIn', header: 'Fan-in', align: 'right', sortValue: (c) => c.fanIn, render: (c) => <span className="font-mono tabular-nums text-ink">{c.fanIn}</span> },
    { key: 'fanOut', header: 'Fan-out', align: 'right', sortValue: (c) => c.fanOut, render: (c) => <span className="font-mono tabular-nums text-ink">{c.fanOut}</span> },
    {
      key: 'score',
      header: 'Coupling Score',
      align: 'right',
      sortValue: (c) => c.score,
      render: (c) => (
        <span className="inline-flex items-center justify-end gap-2">
          <span className="h-1 w-16 overflow-hidden rounded-full bg-edge-soft" aria-hidden>
            <span className="block h-full rounded-full bg-accent/70" style={{ width: `${c.score}%` }} />
          </span>
          <span className="font-mono tabular-nums text-ink">{c.score}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Code Health"
        meta={<span>Complexity, maintainability, coupling, and structural metrics from static analysis.</span>}
      />

      <MetricRow
        cols={5}
        items={data.metrics.map((m) => ({
          label: m.label,
          value: m.score,
          sub: undefined,
          hint: m.hint,
        }))}
      />
      <div className="-mt-2 flex flex-wrap gap-2">
        {data.metrics.map((m) => (
          <Chip key={`tone-${m.label}`} tone={severityTone[m.severity]}>
            {m.label} · {m.score >= 75 ? 'Good' : m.score >= 60 ? 'Fair' : 'Weak'}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Complexity Distribution"
          subtitle="Source files grouped by cyclomatic complexity band. Bands at or above 16 warrant refactoring review."
        >
          <DistributionChart data={data.complexityDistribution} height={230} />
        </Panel>

        <Panel title="Largest Files" subtitle="Top files by lines of code.">
          <BarList
            items={data.largestFiles.slice(0, 8).map((f) => ({
              label: f.path,
              value: f.loc,
              display: `${fmtInt(f.loc)} LOC`,
              sub: `complexity ${f.complexity}`,
              to: `/repository/${repoId}/file/${f.path}`,
            }))}
          />
        </Panel>

        <Panel title="Largest Functions" subtitle="Top functions by lines of code.">
          <BarList
            items={data.largestFunctions.slice(0, 8).map((f) => ({
              label: f.name,
              value: f.loc,
              display: `${f.loc} LOC`,
              sub: `${f.path} · complexity ${f.complexity}`,
            }))}
          />
        </Panel>

        <Panel
          title="Coupling"
          subtitle="Files and modules with the strongest dependency relationships (fan-in / fan-out)."
          actions={<InfoTip label="About coupling scores">Fan-in counts modules importing this module; fan-out counts modules it imports. The score normalizes both to 0–100.</InfoTip>}
          flush
        >
          <DataTable
            columns={couplingColumns}
            rows={data.coupling}
            rowKey={(c) => c.module}
            defaultSort={{ key: 'score', dir: 'desc' }}
            ariaLabel="Coupled modules"
            minTableWidth={480}
          />
        </Panel>
      </div>

      <p className="text-2xs leading-relaxed text-faint">
        Structural metrics are computed deterministically from the import graph and source parse.{' '}
        <Link to={`/repository/${repoId}/hotspots`} className="text-accent hover:underline">
          Cross-reference with hotspots →
        </Link>
      </p>
    </div>
  );
}
