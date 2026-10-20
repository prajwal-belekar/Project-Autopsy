import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { TabBar } from '../../components/common/Tabs';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { Chip } from '../../components/common/Badge';
import { TrendChart } from '../../components/charts/TrendChart';
import { useIssues, usePullRequests } from '../../hooks/useQueries';
import { fmtInt } from '../../utils/format';
import type { ChipTone } from '../../utils/severity';
import type { IssueRecord, PRRecord } from '../../types';

type Tab = 'issues' | 'prs';

const ISSUE_STATE_TONE: Record<IssueRecord['state'], ChipTone> = {
  open: 'accent',
  closed: 'neutral',
  reopened: 'warn',
};

const PR_STATE_TONE: Record<PRRecord['state'], ChipTone> = {
  open: 'accent',
  merged: 'ok',
  closed: 'neutral',
  reopened: 'warn',
};

export default function Issues() {
  const { repoId = '' } = useParams();
  const { data: issues, isLoading } = useIssues(repoId);
  const { data: prs, isLoading: prsLoading } = usePullRequests(repoId);
  const [tab, setTab] = useState<Tab>('issues');

  if (isLoading || prsLoading || !issues || !prs) return <PageSkeleton />;

  const issueColumns: Column<IssueRecord>[] = [
    { key: 'number', header: 'Issue', sortValue: (i) => i.number, render: (i) => <span className="font-mono text-xs text-accent">#{i.number}</span> },
    { key: 'title', header: 'Title', sortValue: (i) => i.title, render: (i) => <span className="text-13 text-ink">{i.title}</span> },
    { key: 'state', header: 'State', sortValue: (i) => i.state, render: (i) => <Chip tone={ISSUE_STATE_TONE[i.state]}>{i.state}</Chip> },
    { key: 'label', header: 'Label', sortValue: (i) => i.label, render: (i) => <span className="text-xs text-dim">{i.label}</span> },
    { key: 'age', header: 'Age', align: 'right', sortValue: (i) => i.ageDays, render: (i) => <span className="font-mono tabular-nums text-dim">{i.ageDays}d</span> },
    { key: 'linked', header: 'Linked Commits', align: 'right', sortValue: (i) => i.linkedCommits, render: (i) => <span className="font-mono tabular-nums text-ink">{i.linkedCommits}</span> },
  ];

  const prColumns: Column<PRRecord>[] = [
    { key: 'number', header: 'PR', sortValue: (p) => p.number, render: (p) => <span className="font-mono text-xs text-accent">#{p.number}</span> },
    { key: 'title', header: 'Title', sortValue: (p) => p.title, render: (p) => <span className="text-13 text-ink">{p.title}</span> },
    { key: 'state', header: 'State', sortValue: (p) => p.state, render: (p) => <Chip tone={PR_STATE_TONE[p.state]}>{p.state}</Chip> },
    { key: 'delta', header: 'Changes', align: 'right', sortValue: (p) => p.additions, render: (p) => (
        <span className="font-mono text-xs tabular-nums">
          <span className="text-ok">+{fmtInt(p.additions)}</span> <span className="text-crit">−{fmtInt(p.deletions)}</span>
        </span>
      ) },
    { key: 'openDays', header: 'Days Open', align: 'right', sortValue: (p) => p.openDays, render: (p) => <span className="font-mono tabular-nums text-dim">{p.openDays}</span> },
    { key: 'files', header: 'Files', align: 'right', sortValue: (p) => p.files, render: (p) => <span className="font-mono tabular-nums text-dim">{p.files}</span> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Issues & Pull Requests"
        meta={<span>Repository issue and pull-request analysis from tracker metadata.</span>}
      />

      <TabBar
        ariaLabel="Issues and pull requests"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'issues', label: 'Issues' },
          { value: 'prs', label: 'Pull Requests' },
        ]}
      />

      {tab === 'issues' ? (
        <div className="space-y-4">
          <MetricRow
            cols={6}
            items={[
              { label: 'Open', value: issues.open },
              { label: 'Closed', value: issues.closed },
              { label: 'Reopened', value: issues.reopened, hint: 'Issues closed and later reopened at least once.' },
              { label: 'Stale', value: issues.stale, hint: 'Open issues with no activity for 60+ days.' },
              { label: 'Bug', value: issues.bugs },
              { label: 'Enhancement', value: issues.enhancements },
            ]}
          />
          <Panel title="Issue Trend" subtitle="Opened, closed, and bug-labeled issues per month.">
            <TrendChart
              data={issues.trend}
              xKey="month"
              height={250}
              series={[
                { key: 'opened', label: 'Opened', color: '#22D3EE' },
                { key: 'closed', label: 'Closed', color: '#22C55E' },
                { key: 'bugs', label: 'Bug-labeled', color: '#EF4444', dashed: true },
              ]}
              valueFormatter={(v) => String(v)}
            />
          </Panel>
          <Panel title="Notable Issues" subtitle="Issues with the strongest connection to code activity." flush>
            <DataTable
              columns={issueColumns}
              rows={issues.top}
              rowKey={(i) => i.id}
              defaultSort={{ key: 'linked', dir: 'desc' }}
              ariaLabel="Notable issues"
              minTableWidth={700}
            />
          </Panel>
        </div>
      ) : (
        <div className="space-y-4">
          <MetricRow
            cols={5}
            items={[
              { label: 'Open', value: prs.open },
              { label: 'Merged', value: prs.merged },
              { label: 'Closed (unmerged)', value: prs.closed },
              { label: 'Long Running', value: prs.longRunning, hint: 'Open pull requests older than 14 days.' },
              { label: 'Reopened', value: prs.reopened },
            ]}
          />
          <Panel title="Pull Request Trend" subtitle="Opened and merged pull requests per month.">
            <TrendChart
              data={prs.trend}
              xKey="month"
              height={250}
              series={[
                { key: 'opened', label: 'Opened', color: '#22D3EE' },
                { key: 'merged', label: 'Merged', color: '#22C55E' },
              ]}
              valueFormatter={(v) => String(v)}
            />
          </Panel>
          <Panel title="Notable Pull Requests" subtitle="Recent pull requests tied to hotspot areas." flush>
            <DataTable
              columns={prColumns}
              rows={prs.top}
              rowKey={(p) => p.id}
              defaultSort={{ key: 'openDays', dir: 'desc' }}
              ariaLabel="Notable pull requests"
              minTableWidth={720}
            />
          </Panel>
        </div>
      )}
    </div>
  );
}
