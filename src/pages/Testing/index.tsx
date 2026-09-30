import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { LevelBadge } from '../../components/common/Badge';
import { SignalNote } from '../../components/evidence/Evidence';
import { TrendChart } from '../../components/charts/TrendChart';
import { useTestingHealth } from '../../hooks/useQueries';
import type { TestingData } from '../../types';

export default function Testing() {
  const { repoId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useTestingHealth(repoId);

  if (isLoading || !data) return <PageSkeleton />;

  const columns: Column<TestingData['riskAreas'][number]>[] = [
    { key: 'module', header: 'Module', sortValue: (r) => r.module, render: (r) => <span className="text-13 text-ink">{r.module}</span> },
    { key: 'path', header: 'File', sortValue: (r) => r.path, render: (r) => <span className="block max-w-[260px] truncate font-mono text-xs text-dim">{r.path}</span> },
    { key: 'risk', header: 'Risk', align: 'right', sortValue: (r) => r.risk, render: (r) => <span className="font-mono tabular-nums text-ink">{r.risk}</span> },
    { key: 'complexity', header: 'Complexity', align: 'right', sortValue: (r) => r.complexity, render: (r) => <span className="font-mono tabular-nums text-ink">{r.complexity}</span> },
    { key: 'testSignal', header: 'Test Signal', sortValue: (r) => r.testSignal, render: (r) => <LevelBadge level={r.testSignal} lowIsBad /> },
    { key: 'churn', header: 'Churn', sortValue: (r) => r.churn, render: (r) => <LevelBadge level={r.churn} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Testing Health"
        meta={<span>Testing structure and testing activity reconstructed from the repository.</span>}
      />

      <MetricRow
        cols={3}
        items={[
          { label: 'Test Files', value: data.testFiles },
          { label: 'Source Files', value: data.sourceFiles },
          { label: 'Test / Source Ratio', value: `${data.ratioPct}%` },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Test Infrastructure" subtitle="Detected testing setup, based on configuration files and directory structure.">
          <ul className="divide-y divide-edge-soft/60">
            {data.suites.map((s) => (
              <li key={s.name} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-13 text-ink">{s.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-faint">{s.evidence}</p>
                </div>
                <LevelBadge level={s.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Testing Activity Over Time" subtitle="Test commits and distinct test files touched per month.">
          <TrendChart
            data={data.activity}
            xKey="month"
            height={240}
            series={[
              { key: 'testCommits', label: 'Test commits', color: '#22D3EE', area: true },
              { key: 'testFiles', label: 'Test files touched', color: '#8B5CF6', dashed: true },
            ]}
            valueFormatter={(v) => String(v)}
          />
        </Panel>
      </div>

      <Panel
        title="High-Risk Areas With Limited Test Activity"
        subtitle="Files where elevated risk signals coincide with a low test signal."
        flush
      >
        <DataTable
          columns={columns}
          rows={data.riskAreas}
          rowKey={(r) => r.path}
          defaultSort={{ key: 'risk', dir: 'desc' }}
          ariaLabel="High-risk areas with limited test activity"
          minTableWidth={720}
          onRowClick={(r) => navigate(`/repository/${repoId}/file/${r.path}`)}
        />
        <div className="px-4 pb-3">
          <SignalNote>{data.note}</SignalNote>
        </div>
      </Panel>
    </div>
  );
}
