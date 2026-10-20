import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { PageSkeleton } from '../../components/common/Skeleton';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { LevelBadge, SeverityBadge } from '../../components/common/Badge';
import { FilterBar, SearchInput, SelectFilter } from '../../components/common/Filters';
import { useDebounce } from '../../hooks/useDebounce';
import { useHotspots } from '../../hooks/useQueries';
import { daysSince } from '../../utils/format';
import type { Hotspot } from '../../types';

const CHURN_RANK: Record<string, number> = { high: 3, medium: 2, moderate: 2, low: 1 };
const RANGE_DAYS: Record<string, number> = { '30D': 30, '90D': 90, '1Y': 365, ALL: Number.MAX_SAFE_INTEGER };

export default function Hotspots() {
  const { repoId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useHotspots(repoId);

  const [risk, setRisk] = useState('all');
  const [module, setModule] = useState('all');
  const [lang, setLang] = useState('all');
  const [type, setType] = useState('all');
  const [range, setRange] = useState('ALL');
  const [query, setQuery] = useState('');
  const dq = useDebounce(query);

  const modules = useMemo(() => [...new Set((data ?? []).map((h) => h.module))].sort(), [data]);
  const langs = useMemo(() => [...new Set((data ?? []).map((h) => h.language))].sort(), [data]);
  const types = useMemo(() => [...new Set((data ?? []).map((h) => h.ext))].sort(), [data]);

  const filtered = useMemo(
    () =>
      (data ?? []).filter((h) => {
        if (risk !== 'all' && h.riskSeverity !== risk) return false;
        if (module !== 'all' && h.module !== module) return false;
        if (lang !== 'all' && h.language !== lang) return false;
        if (type !== 'all' && h.ext !== type) return false;
        if (daysSince(h.lastTouched) > RANGE_DAYS[range]) return false;
        if (dq && !h.path.toLowerCase().includes(dq.toLowerCase())) return false;
        return true;
      }),
    [data, risk, module, lang, type, range, dq],
  );

  if (isLoading || !data) return <PageSkeleton />;

  const columns: Column<Hotspot>[] = [
    {
      key: 'path',
      header: 'File',
      sortValue: (h) => h.path,
      render: (h) => (
        <span className="block max-w-[300px] truncate font-mono text-xs text-dim" title={h.path}>
          {h.path}
        </span>
      ),
    },
    {
      key: 'complexity',
      header: 'Complexity',
      align: 'right',
      sortValue: (h) => h.complexity,
      render: (h) => <span className="font-mono tabular-nums text-ink">{h.complexity}</span>,
    },
    {
      key: 'revisions',
      header: 'Revisions',
      align: 'right',
      sortValue: (h) => h.revisions,
      render: (h) => <span className="font-mono tabular-nums text-ink">{h.revisions}</span>,
    },
    {
      key: 'churn',
      header: 'Churn',
      sortValue: (h) => CHURN_RANK[h.churnLevel] ?? 0,
      render: (h) => <LevelBadge level={h.churnLevel} />,
    },
    {
      key: 'bugFixes',
      header: 'Bug Fixes',
      align: 'right',
      sortValue: (h) => h.bugFixes,
      render: (h) => <span className="font-mono tabular-nums text-ink">{h.bugFixes}</span>,
    },
    {
      key: 'testSignal',
      header: 'Test Signal',
      sortValue: (h) => h.testSignal,
      render: (h) => <LevelBadge level={h.testSignal} lowIsBad />,
    },
    {
      key: 'risk',
      header: 'Risk',
      align: 'right',
      sortValue: (h) => h.risk,
      render: (h) => (
        <span className="inline-flex items-center justify-end gap-2">
          <SeverityBadge severity={h.riskSeverity} />
          <span className="font-mono tabular-nums text-ink">{h.risk}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Engineering Hotspots"
        meta={<span>Repository areas combining multiple risk signals · {filtered.length} of {data.length} files</span>}
      />

      <Panel flush>
        <div className="border-b border-edge-soft p-3">
          <FilterBar>
            <SelectFilter
              label="Risk"
              value={risk}
              onChange={setRisk}
              options={[
                { value: 'all', label: 'All levels' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <SelectFilter
              label="Module"
              value={module}
              onChange={setModule}
              options={[{ value: 'all', label: 'All modules' }, ...modules.map((m) => ({ value: m, label: m }))]}
            />
            <SelectFilter
              label="Language"
              value={lang}
              onChange={setLang}
              options={[{ value: 'all', label: 'All languages' }, ...langs.map((l) => ({ value: l, label: l }))]}
            />
            <SelectFilter
              label="Type"
              value={type}
              onChange={setType}
              options={[{ value: 'all', label: 'All types' }, ...types.map((t) => ({ value: t, label: t }))]}
            />
            <SelectFilter
              label="Last touched"
              value={range}
              onChange={setRange}
              options={[
                { value: 'ALL', label: 'Any time' },
                { value: '30D', label: 'Last 30 days' },
                { value: '90D', label: 'Last 90 days' },
                { value: '1Y', label: 'Last year' },
              ]}
            />
            <SearchInput value={query} onChange={setQuery} placeholder="Search files..." className="ml-auto w-full sm:w-56" />
          </FilterBar>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(h) => h.path}
          defaultSort={{ key: 'risk', dir: 'desc' }}
          ariaLabel="Engineering hotspots"
          minTableWidth={860}
          emptyTitle="No files match the current filters"
          emptyMessage="Adjust the risk, module, language, or date-range filters to see more results."
          onRowClick={(h) => navigate(`/repository/${repoId}/file/${h.path}`)}
        />
      </Panel>

      <p className="text-2xs leading-relaxed text-faint">
        Risk is computed from the listed metrics — complexity, revisions, churn, bug-fix count, revert
        count, and test signal. Click a file to open its investigation.
      </p>
    </div>
  );
}
