import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { Chip, SeverityBadge } from '../../components/common/Badge';
import { FilterBar, SearchInput, SelectFilter } from '../../components/common/Filters';
import { SignalNote } from '../../components/evidence/Evidence';
import { useDebounce } from '../../hooks/useDebounce';
import { useTechnicalDebt } from '../../hooks/useQueries';
import { fmtInt } from '../../utils/format';
import type { DebtMarker } from '../../types';

export default function TechnicalDebt() {
  const { repoId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useTechnicalDebt(repoId);

  const [type, setType] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [query, setQuery] = useState('');
  const dq = useDebounce(query);

  const filtered = useMemo(
    () =>
      (data?.register ?? []).filter((d) => {
        if (type !== 'all' && d.type !== type) return false;
        if (severity !== 'all' && d.severity !== severity) return false;
        if (dq && !`${d.location} ${d.description}`.toLowerCase().includes(dq.toLowerCase())) return false;
        return true;
      }),
    [data, type, severity, dq],
  );

  if (isLoading || !data) return <PageSkeleton />;

  const columns: Column<DebtMarker>[] = [
    {
      key: 'location',
      header: 'Location',
      sortValue: (d) => d.location,
      render: (d) => (
        <span className="block max-w-[280px] truncate font-mono text-xs text-dim" title={`${d.location}:${d.line}`}>
          {d.location}
          {d.line > 1 ? `:${d.line}` : ''}
        </span>
      ),
    },
    { key: 'type', header: 'Type', sortValue: (d) => d.type, render: (d) => <Chip tone="neutral" dot={false}>{d.type}</Chip> },
    { key: 'severity', header: 'Severity', sortValue: (d) => rankSeverity(d.severity), render: (d) => <SeverityBadge severity={d.severity} /> },
    { key: 'age', header: 'Age', align: 'right', sortValue: (d) => d.ageDays, render: (d) => <span className="font-mono tabular-nums text-dim">{d.ageDays} days</span> },
    { key: 'description', header: 'Description', render: (d) => <span className="text-xs text-dim">{d.description}</span> },
  ];

  const counts: { label: string; value: number }[] = [
    { label: 'TODO', value: data.counts.todo },
    { label: 'FIXME', value: data.counts.fixme },
    { label: 'HACK', value: data.counts.hack },
    { label: 'Large Functions', value: data.counts.largeFunctions },
    { label: 'Potential Duplication', value: data.counts.duplication },
    { label: 'Deprecated Usage', value: data.counts.deprecated },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Technical Debt"
        meta={<span>Debt markers, duplication, and deprecation signals from source analysis. Total markers: {fmtInt(counts.reduce((s, c) => s + c.value, 0))}</span>}
      />

      <MetricRow cols={6} items={counts.map((c) => ({ label: c.label, value: fmtInt(c.value) }))} />

      <Panel title="Technical Debt Register" subtitle="Highest-severity entries, tracked with source-derived ages." flush>
        <div className="border-b border-edge-soft p-3">
          <FilterBar>
            <SelectFilter
              label="Type"
              value={type}
              onChange={setType}
              options={[
                { value: 'all', label: 'All types' },
                ...['TODO', 'FIXME', 'HACK', 'Large Function', 'Duplication', 'Deprecated Usage'].map((t) => ({ value: t, label: t })),
              ]}
            />
            <SelectFilter
              label="Severity"
              value={severity}
              onChange={setSeverity}
              options={[
                { value: 'all', label: 'All severities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <SearchInput value={query} onChange={setQuery} placeholder="Search locations..." className="ml-auto w-full sm:w-56" />
          </FilterBar>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(d) => d.id}
          defaultSort={{ key: 'age', dir: 'desc' }}
          ariaLabel="Technical debt register"
          minTableWidth={820}
          emptyTitle="No Technical Debt Detected"
          emptyMessage="No debt markers match the current filters. When the repository contains no TODO, FIXME, HACK, or comparable markers, this register is empty by design."
          onRowClick={(d) => {
            const basePath = d.location.split(' ')[0].split('+')[0].replace(/:\d+$/, '').replace(/→.*$/, '').trim();
            if (basePath.startsWith('src/')) navigate(`/repository/${repoId}/file/${basePath}`);
          }}
        />
        <div className="px-4 pb-3">
          <SignalNote>{data.note}</SignalNote>
        </div>
      </Panel>
    </div>
  );
}

function rankSeverity(s: DebtMarker['severity']): number {
  return { critical: 4, high: 3, medium: 2, low: 1, informational: 0 }[s];
}
