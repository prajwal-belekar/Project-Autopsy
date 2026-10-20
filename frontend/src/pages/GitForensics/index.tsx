import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { RangeTabs } from '../../components/common/Tabs';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { InfoTip } from '../../components/common/InfoTip';
import { SignalNote } from '../../components/evidence/Evidence';
import { CollapsibleSection } from '../../components/common/Collapsible';
import { ActivityChart } from '../../components/charts/ActivityChart';
import { BarList } from '../../components/charts/BarList';
import { useGitForensics } from '../../hooks/useQueries';
import { fmtInt } from '../../utils/format';
import type { RangeKey } from '../../utils/series';
import type { StallPeriod } from '../../types';

const RANGE_MONTHS: Record<RangeKey, number> = { '30D': 2, '90D': 3, '6M': 6, '1Y': 12, ALL: 12 };

const CLASSIFICATION_RULES: [string, string][] = [
  ['feat · feature · add …', 'Feature'],
  ['fix · bug · patch · hotfix …', 'Bug Fix'],
  ['refactor · clean · restructure · extract …', 'Refactor'],
  ['docs · documentation …', 'Documentation'],
  ['chore · deps · build · ci · config …', 'Chore'],
  ['test · spec · coverage …', 'Test'],
  ['no match — path heuristics (tests/ → Test, docs/ → Documentation)', 'Other'],
];

export default function GitForensics() {
  const { repoId = '' } = useParams();
  const { data, isLoading } = useGitForensics(repoId);
  const [range, setRange] = useState<RangeKey>('1Y');

  if (isLoading || !data) return <PageSkeleton />;

  const months = data.activity.slice(-RANGE_MONTHS[range]);
  const churnData = data.churn.slice(-RANGE_MONTHS[range]).map((m) => ({
    month: m.month,
    added: m.additions,
    deleted: m.deletions,
    net: m.additions - m.deletions,
  }));

  const stallColumns: Column<StallPeriod>[] = [
    { key: 'period', header: 'Period', sortValue: (s) => s.period, render: (s) => <span className="text-13 text-ink">{s.period}</span> },
    { key: 'inactive', header: 'Inactive Days', align: 'right', sortValue: (s) => s.inactiveDays, render: (s) => <span className="font-mono tabular-nums text-ink">{s.inactiveDays}</span> },
    { key: 'change', header: 'Subsequent Change', align: 'right', sortValue: (s) => s.inactiveDays, render: (s) => <span className="font-mono tabular-nums text-dim">{s.subsequentChange}</span> },
    { key: 'area', header: 'Affected Area', sortValue: (s) => s.affectedArea, render: (s) => <span className="text-13 text-dim">{s.affectedArea}</span> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Git Forensics"
        meta={<span>Historical repository activity reconstructed from Git metadata.</span>}
      />

      <MetricRow
        cols={6}
        items={[
          { label: 'Commits', value: fmtInt(data.totals.commits) },
          { label: 'Active Days', value: fmtInt(data.totals.activeDays) },
          { label: 'Avg Changes / Commit', value: `${data.totals.avgChangesPerCommit} lines` },
          { label: 'Reverts', value: fmtInt(data.totals.reverts), hint: 'Commits that undo a previous change.' },
          { label: 'Bug-Fix Commits', value: fmtInt(data.totals.bugFixCommits) },
          { label: 'Refactor Commits', value: fmtInt(data.totals.refactorCommits) },
        ]}
      />

      <Panel
        title="Commit Activity"
        subtitle="Commits, additions, and deletions per month."
        actions={<RangeTabs value={range} onChange={setRange} />}
      >
        <ActivityChart
          data={months}
          xKey="month"
          bars={[
            { key: 'additions', label: 'Additions', color: '#22C55E' },
            { key: 'deletions', label: 'Deletions', color: '#EF4444' },
          ]}
          lines={[{ key: 'commits', label: 'Commits', color: '#22D3EE', right: true }]}
          height={260}
          leftFormatter={(v) => fmtInt(Number(v) / 1000) + 'k'}
          rightFormatter={(v) => String(v)}
          valueFormatter={(v) => fmtInt(Number(v))}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-dim">
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-2 w-2.5 rounded-[2px] bg-ok/50" />Additions (left axis)</li>
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-2 w-2.5 rounded-[2px] bg-crit/50" />Deletions (left axis)</li>
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block w-3.5 border-t-2 border-accent" />Commits (right axis)</li>
          </ul>
          <span className="text-2xs text-faint">Lines (k, left) · commits (right)</span>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Commit Classification" subtitle="Distribution of commits by classified type.">
          <BarList
            items={data.classification.map((c) => ({
              label: c.type,
              value: c.count,
              display: `${fmtInt(c.count)} · ${c.pct}%`,
              color: c.color,
            }))}
          />
          <div className="mt-3 border-t border-edge-soft pt-3">
            <CollapsibleSection title="Classification methodology">
              <div className="space-y-2.5">
                <p className="text-xs leading-relaxed text-dim">
                  Commits are classified by deterministic rules over the commit message prefix and
                  changed paths. Classification is approximate — treat distributions as triage
                  signals, not audit records.
                </p>
                <ul className="space-y-1">
                  {CLASSIFICATION_RULES.map(([rule, label]) => (
                    <li key={label} className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="font-mono text-2xs text-faint">{rule}</span>
                      <span className="shrink-0 text-dim">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleSection>
          </div>
        </Panel>

        <Panel title="Code Churn" subtitle="Lines added and deleted per month, with net change.">
          <ActivityChart
            data={churnData}
            xKey="month"
            bars={[
              { key: 'added', label: 'Lines added', color: '#22D3EE' },
              { key: 'deleted', label: 'Lines deleted', color: '#F97316' },
            ]}
            lines={[{ key: 'net', label: 'Net change', color: '#8B5CF6', dashed: true }]}
            height={200}
            leftFormatter={(v) => (Number(v) >= 1000 ? `${Number(v) / 1000}k` : String(v))}
            valueFormatter={(v) => fmtInt(Number(v))}
          />
          <div className="mt-3 border-t border-edge-soft pt-3">
            <p className="mb-1.5 text-xs text-faint">High-churn files</p>
            <BarList
              items={data.highChurnFiles.map((f) => ({
                label: f.path,
                value: f.added + f.deleted,
                display: `+${fmtInt(f.added)} / −${fmtInt(f.deleted)}`,
                sub: `${f.revisions} revisions · net ${f.net >= 0 ? '+' : ''}${fmtInt(f.net)}`,
                to: `/repository/${repoId}/file/${f.path}`,
              }))}
            />
          </div>
        </Panel>
      </div>

      <Panel
        title="Rework Signals"
        subtitle="Observable repository patterns associated with repeated work."
      >
        <MetricRow
          cols={4}
          items={[
            { label: 'Repeatedly Modified Files', value: data.rework.repeatedlyModifiedFiles, hint: 'Files modified 5 or more times in the analysis window.' },
            { label: 'Reverts', value: data.rework.reverts },
            { label: 'Repeated Bug Fixes', value: data.rework.repeatedBugFixes, hint: 'Files receiving 3 or more bug-fix commits.' },
            { label: 'High-Churn Hotspots', value: data.rework.highChurnHotspots },
          ]}
        />
        <div className="mt-3">
          <SignalNote>
            These are observable repository patterns and do not establish developer intent.
          </SignalNote>
        </div>
      </Panel>

      <Panel
        title="Development Stall Signals"
        subtitle="Periods of unusually low repository activity followed by substantial repository changes."
        flush
        actions={<InfoTip label="About stall signals">Stalls are detected from commit-timestamp gaps of 4 or more days followed by an above-average change set within 3 days.</InfoTip>}
      >
        <DataTable
          columns={stallColumns}
          rows={data.stalls}
          rowKey={(s) => s.id}
          defaultSort={{ key: 'inactive', dir: 'desc' }}
          ariaLabel="Development stall signals"
          minTableWidth={640}
        />
        <div className="px-4 pb-3">
          <SignalNote>
            Stalls are reconstructed from commit timestamps and change volume. They are activity
            patterns — not conclusions about individuals.
          </SignalNote>
        </div>
      </Panel>

      <Panel
        title="Activity Patterns"
        subtitle="Aggregated repository-level signals derived from commit metadata."
      >
        <ul className="divide-y divide-edge-soft/60">
          {data.patterns.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-13 text-ink">
                  {p.name}
                  <InfoTip label={`${p.name} — detection method`}>{p.method}</InfoTip>
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-faint">{p.description}</p>
              </div>
              <span className="shrink-0 font-mono text-13 tabular-nums text-ink">
                {p.commits} commits
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <SignalNote>
            Presented as observable signals only. They do not describe individual developers, intent,
            or psychological state, and no personality or performance score is derived from them.
          </SignalNote>
        </div>
      </Panel>

      <p className="text-2xs leading-relaxed text-faint">
        Raw history underpins every signal on this page.{' '}
        <Link to={`/repository/${repoId}/findings`} className="text-accent hover:underline">
          See the findings derived from it →
        </Link>
      </p>
    </div>
  );
}
