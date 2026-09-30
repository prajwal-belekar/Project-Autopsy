import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow, ScoreBarRow } from '../../components/common/Metric';
import { ScoreRing } from '../../components/common/ScoreRing';
import { Chip, LevelBadge, SeverityBadge } from '../../components/common/Badge';
import { InfoTip } from '../../components/common/InfoTip';
import { PageSkeleton } from '../../components/common/Skeleton';
import { RangeTabs } from '../../components/common/Tabs';
import { CollapsibleSection } from '../../components/common/Collapsible';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { EvidenceList, WeightsTable } from '../../components/evidence/Evidence';
import { TrendChart } from '../../components/charts/TrendChart';
import {
  useEvolution,
  useFindings,
  useFriction,
  useHealthMetrics,
  useHotspots,
  usePrimaryFinding,
} from '../../hooks/useQueries';
import { useActiveRepository } from '../../hooks/useActiveRepository';
import { sliceRange, type RangeKey } from '../../utils/series';
import { fmtDay, fmtInt, fmtSigned } from '../../utils/format';
import { severityTone } from '../../utils/severity';
import type { Hotspot } from '../../types';

export default function Overview() {
  const { repoId = '' } = useParams();
  const navigate = useNavigate();
  const { repository: repo } = useActiveRepository();
  const health = useHealthMetrics(repoId);
  const finding = usePrimaryFinding(repoId);
  const friction = useFriction(repoId);
  const hotspots = useHotspots(repoId);
  const findings = useFindings(repoId);
  const evolution = useEvolution(repoId);
  const [range, setRange] = useState<RangeKey>('6M');

  const series = useMemo(
    () => (friction.data ? sliceRange(friction.data.series, range, 120) : []),
    [friction.data, range],
  );

  // The AppShell resolves the repository before rendering the workspace,
  // so `repo` here is already loaded via the shared outlet context.
  if (health.isLoading || friction.isLoading || finding.isLoading) {
    return <PageSkeleton />;
  }
  if (!repo || !health.data || !friction.data || !finding.data) {
    return <p className="py-12 text-center text-xs text-faint">No sufficient evidence is available for this metric.</p>;
  }

  const r = repo;
  const fr = friction.data;
  const topHotspots = [...(hotspots.data ?? [])].sort((a, b) => b.risk - a.risk).slice(0, 5);
  const topFindings = (findings.data ?? []).slice(0, 3);
  const events = [...(evolution.data?.events ?? [])].slice(-4).reverse();

  const previewColumns: Column<Hotspot>[] = [
    {
      key: 'path',
      header: 'File',
      render: (h) => (
        <span className="block max-w-[260px] truncate font-mono text-xs text-dim" title={h.path}>
          {h.path}
        </span>
      ),
      sortValue: (h) => h.path,
    },
    { key: 'complexity', header: 'Complexity', align: 'right', sortValue: (h) => h.complexity, render: (h) => <span className="font-mono tabular-nums text-ink">{h.complexity}</span> },
    { key: 'revisions', header: 'Revisions', align: 'right', sortValue: (h) => h.revisions, render: (h) => <span className="font-mono tabular-nums text-ink">{h.revisions}</span> },
    { key: 'bugFixes', header: 'Bug Fixes', align: 'right', sortValue: (h) => h.bugFixes, render: (h) => <span className="font-mono tabular-nums text-ink">{h.bugFixes}</span> },
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
        title="Repository Overview"
        meta={
          <>
            <span className="text-dim">{r.name}</span>
            <span className="font-mono">{r.branch}</span>
            <span>{r.language}</span>
            <span className="hidden font-mono md:inline">{r.url}</span>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="text-2xs text-faint">Analysis complete</span>
            <Chip tone="ok" dot={false}>
              {r.analysisStatus === 'complete' ? 'Up to date' : 'Partial'}
            </Chip>
          </div>
        }
      />

      {/* 1. Repository summary metrics */}
      <MetricRow
        items={[
          { label: 'Files', value: fmtInt(r.files) },
          { label: 'Lines of Code', value: fmtInt(r.linesOfCode) },
          { label: 'Commits', value: fmtInt(r.commits) },
          { label: 'Contributors', value: fmtInt(r.contributors) },
          { label: 'Active Days', value: fmtInt(r.activeDays) },
          { label: 'Project Age', value: `${r.ageMonths} months` },
        ]}
      />

      {/* 2. Overall health + 3. Primary area requiring attention */}
      <div className="grid gap-4 xl:grid-cols-12">
        <Panel
          title="Repository Health"
          className="xl:col-span-5"
          actions={<InfoTip label="About the health score">{health.data.methodology}</InfoTip>}
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2.5">
              <ScoreRing score={health.data.overall} label={`Repository health ${health.data.overall} of 100`} />
              <Chip tone={severityTone[health.data.statusSeverity]} dot={false}>
                {health.data.status}
              </Chip>
            </div>
            <ul className="w-full min-w-0 flex-1">
              {health.data.metrics.map((m) => (
                <ScoreBarRow
                  key={m.label}
                  label={m.label}
                  value={m.score}
                  hint={m.hint}
                  statusLabel={m.status}
                  statusTone={severityTone[m.severity]}
                />
              ))}
            </ul>
          </div>
        </Panel>

        <Panel
          title="Primary Area Requiring Attention"
          className="xl:col-span-7"
          subtitle="Highest combined friction and risk signal in the analyzed repository."
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="shrink-0 sm:w-44">
              <p className="font-mono text-[16px] font-semibold text-ink">{finding.data.area}</p>
              <p className="mt-0.5 break-all font-mono text-2xs text-faint">{finding.data.filePath}</p>
              <div className="mt-2.5">
                <SeverityBadge severity={finding.data.severity} label={finding.data.summary} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-2xs font-medium uppercase tracking-wider text-faint">Evidence</p>
              <EvidenceList items={finding.data.evidence} />
            </div>
          </div>
          <div className="mt-3 border-t border-edge-soft pt-3">
            <Link
              to={`/repository/${repoId}/file/${finding.data.filePath}`}
              className="inline-flex items-center gap-1.5 text-13 font-medium text-accent transition-opacity hover:opacity-80"
            >
              View investigation <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </Panel>
      </div>

      {/* 4. Development friction */}
      <Panel
        title="Development Friction"
        subtitle={fr.description}
        actions={
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[20px] font-semibold tabular-nums text-ink">
              {fr.score}
              <span className="text-faint"> / 100</span>
            </span>
            <LevelBadge level={fr.level} />
          </div>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-faint">Friction score over time</p>
              <RangeTabs value={range} onChange={setRange} />
            </div>
            <TrendChart
              data={series}
              xKey="date"
              height={232}
              yDomain={[0, 100]}
              series={[{ key: 'score', label: 'Friction score', color: '#22D3EE', area: true }]}
              xTickFormatter={(d) => fmtDay(d)}
              valueFormatter={(v) => `${v} / 100`}
            />
          </div>
          <div>
            <p className="mb-2 text-xs text-faint">Contributing factors</p>
            <ul className="space-y-1.5">
              {fr.factors.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center justify-between gap-2 rounded-md border border-edge-soft bg-panel px-2.5 py-2"
                >
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-dim">
                    <span className="truncate">{f.name}</span>
                    <InfoTip label={`${f.name} — signal source`}>
                      {f.description}
                      <span className="mt-1 block font-mono text-[10px] text-faint">
                        Source: {f.source} · weight {f.weightPct}%
                      </span>
                    </InfoTip>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="font-mono text-2xs text-faint">{f.weightPct}%</span>
                    <LevelBadge level={f.level} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 border-t border-edge-soft pt-3">
          <CollapsibleSection title="How is Development Friction calculated?">
            <WeightsTable weights={fr.weights} note={fr.note} />
          </CollapsibleSection>
        </div>
      </Panel>

      {/* 5. Hotspots + 6. Findings */}
      <div className="grid gap-4 xl:grid-cols-12">
        <Panel
          title="Engineering Hotspots"
          subtitle="Top files combining complexity, churn, and defect-fix signals."
          className="xl:col-span-7"
          flush
          actions={
            <Link
              to={`/repository/${repoId}/hotspots`}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-80"
            >
              View all <ArrowRight aria-hidden className="size-3" />
            </Link>
          }
        >
          <DataTable
            columns={previewColumns}
            rows={topHotspots}
            rowKey={(h) => h.path}
            defaultSort={{ key: 'risk', dir: 'desc' }}
            pageSize={5}
            ariaLabel="Top engineering hotspots"
            minTableWidth={560}
            onRowClick={(h) => navigate(`/repository/${repoId}/file/${h.path}`)}
          />
        </Panel>

        <Panel
          title="Important Findings"
          className="xl:col-span-5"
          actions={
            <Link
              to={`/repository/${repoId}/findings`}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-80"
            >
              View all <ArrowRight aria-hidden className="size-3" />
            </Link>
          }
        >
          <ul className="divide-y divide-edge-soft/60">
            {topFindings.map((f) => (
              <li key={f.id} className="py-2.5 first:pt-0 last:pb-0">
                <Link to={`/repository/${repoId}/findings#${f.id}`} className="group block">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <span className="font-mono text-2xs uppercase tracking-wider text-faint">{f.area}</span>
                  </div>
                  <p className="mt-1 text-13 leading-snug text-dim transition-colors group-hover:text-ink">
                    {f.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* 7. Evolution */}
      <Panel
        title="Repository Evolution"
        subtitle="Most recent structural changes."
        actions={
          <Link
            to={`/repository/${repoId}/evolution`}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-80"
          >
            View full timeline <ArrowRight aria-hidden className="size-3" />
          </Link>
        }
      >
        <ol>
          {events.map((e) => (
            <li key={e.id} className="flex gap-3 pb-3.5 last:pb-0">
              <div className="flex flex-col items-center pt-1.5">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
                <span aria-hidden className="mt-0.5 w-px flex-1 bg-edge-soft" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-2xs text-faint">{e.month}</span>
                  <span className="text-13 text-ink">{e.title}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-faint">{e.description}</p>
              </div>
              <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                <Chip
                  tone={e.complexityChange > 6 ? 'high' : e.complexityChange > 0 ? 'warn' : 'ok'}
                  dot={false}
                >
                  complexity {fmtSigned(e.complexityChange)}
                </Chip>
                <Chip
                  tone={e.frictionChange > 6 ? 'high' : e.frictionChange > 0 ? 'warn' : 'ok'}
                  dot={false}
                >
                  friction {fmtSigned(e.frictionChange)}
                </Chip>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
