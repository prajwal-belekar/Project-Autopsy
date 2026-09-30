import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { MetricRow } from '../../components/common/Metric';
import { PageSkeleton } from '../../components/common/Skeleton';
import { TabBar } from '../../components/common/Tabs';
import { DataTable } from '../../components/common/DataTable';
import type { Column } from '../../components/common/DataTable';
import { Chip, LevelBadge, SeverityBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { SignalNote } from '../../components/evidence/Evidence';
import { FindingCard } from '../../components/findings/FindingCard';
import { useFileDetails } from '../../hooks/useQueries';
import { fmtDate, fmtInt } from '../../utils/format';
import type { ChipTone } from '../../utils/severity';
import type { FileCommit, FileDebtMarker, FileImport, FunctionInfo } from '../../types';

type Tab = 'overview' | 'structure' | 'history' | 'findings';

const TYPE_TONE: Record<string, ChipTone> = {
  Feature: 'accent',
  'Bug Fix': 'crit',
  Revert: 'high',
  Refactor: 'note',
  Test: 'warn',
  Documentation: 'ok',
  Chore: 'neutral',
  Other: 'neutral',
};

export default function FileInvestigation() {
  const { repoId = '', '*': rawPath = '' } = useParams();
  const path = decodeURIComponent(rawPath);
  const { data: file, isLoading, isError } = useFileDetails(repoId, path);
  const [tab, setTab] = useState<Tab>('overview');

  if (isError) {
    return (
      <EmptyState
        title="File not found in analysis dataset"
        message={`No analysis evidence is available for “${path}”.`}
        action={
          <Link
            to={`/repository/${repoId}/hotspots`}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
          >
            Back to hotspots
          </Link>
        }
      />
    );
  }
  if (isLoading || !file) return <PageSkeleton />;

  /* ------------------------------ Overview ------------------------------ */

  const riskFactors: { label: string; level: Parameters<typeof LevelBadge>[0]['level']; lowIsBad?: boolean; note: string }[] = [
    { label: 'Churn', level: file.churnLevel, note: `${fmtInt(file.linesAdded)} lines added · ${fmtInt(file.linesDeleted)} deleted` },
    {
      label: 'Complexity',
      level: file.complexity >= 20 ? 'high' : file.complexity >= 10 ? 'medium' : 'low',
      note: `Cyclomatic complexity ${file.complexity}`,
    },
    {
      label: 'Bug-fix activity',
      level: file.bugFixes >= 5 ? 'high' : file.bugFixes >= 2 ? 'medium' : 'low',
      note: `${file.bugFixes} bug-fix commits`,
    },
    {
      label: 'Rework / reverts',
      level: file.reverts >= 2 ? 'high' : file.reverts >= 1 ? 'medium' : 'low',
      note: `${file.reverts} revert commits`,
    },
    { label: 'Test signal', level: file.testSignal, lowIsBad: true, note: 'Observed test-file activity touching this file' },
  ];

  const overview = (
    <div className="space-y-4">
      <MetricRow
        cols={4}
        items={[
          { label: 'Lines of Code', value: fmtInt(file.loc) },
          { label: 'Functions', value: fmtInt(file.functions) },
          { label: 'Cyclomatic Complexity', value: file.complexity },
          { label: 'Revisions', value: fmtInt(file.revisions) },
          { label: 'Lines Added', value: fmtInt(file.linesAdded) },
          { label: 'Lines Deleted', value: fmtInt(file.linesDeleted) },
          { label: 'Bug-Fix Commits', value: fmtInt(file.bugFixes) },
          { label: 'Reverts', value: fmtInt(file.reverts) },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Change Signals">
          <ul className="divide-y divide-edge-soft/60 text-13">
            {[
              ['Churn level', <LevelBadge key="c" level={file.churnLevel} />],
              ['Net lines', <span key="n" className="font-mono tabular-nums text-ink">{fmtSignedLocal(file.linesAdded - file.linesDeleted)}</span>],
              ['Bug-fix commits', <span key="b" className="font-mono tabular-nums text-ink">{file.bugFixes}</span>],
              ['Reverts', <span key="r" className="font-mono tabular-nums text-ink">{file.reverts}</span>],
            ].map(([label, node]) => (
              <li key={String(label)} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span className="text-dim">{label}</span>
                {node}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Structural Signals">
          <ul className="divide-y divide-edge-soft/60 text-13">
            {[
              ['Complexity', <span key="x" className="font-mono tabular-nums text-ink">{file.complexity}</span>],
              ['Coupling (in / out)', <span key="cp" className="font-mono tabular-nums text-ink">{file.coupling.afferent} / {file.coupling.efferent}</span>],
              ['Test signal', <LevelBadge key="t" level={file.testSignal} lowIsBad />],
              ['Debt markers', <span key="d" className="font-mono tabular-nums text-ink">{file.debtCount}</span>],
            ].map(([label, node]) => (
              <li key={String(label)} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span className="text-dim">{label}</span>
                {node}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Risk Assessment" subtitle="Signals contributing to the composite file risk.">
          <ul className="space-y-2">
            {riskFactors.map((f) => (
              <li key={f.label} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5 text-dim">
                  <span className="truncate">{f.label}</span>
                  <span className="truncate font-mono text-2xs text-faint">{f.note}</span>
                </span>
                <LevelBadge level={f.level} lowIsBad={f.lowIsBad} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );

  /* --------------------------- Code structure --------------------------- */

  const fnColumns: Column<FunctionInfo>[] = [
    { key: 'name', header: 'Function', sortValue: (f) => f.name, render: (f) => <span className="font-mono text-xs text-ink">{f.name}</span> },
    { key: 'loc', header: 'LOC', align: 'right', sortValue: (f) => f.loc, render: (f) => <span className="font-mono tabular-nums text-ink">{f.loc}</span> },
    { key: 'complexity', header: 'Complexity', align: 'right', sortValue: (f) => f.complexity, render: (f) => <span className="font-mono tabular-nums text-ink">{f.complexity}</span> },
    { key: 'nesting', header: 'Nesting', align: 'right', sortValue: (f) => f.nesting, render: (f) => <span className="font-mono tabular-nums text-dim">{f.nesting}</span> },
    { key: 'params', header: 'Params', align: 'right', sortValue: (f) => f.params, render: (f) => <span className="font-mono tabular-nums text-dim">{f.params}</span> },
  ];

  const impColumns: Column<FileImport>[] = [
    { key: 'source', header: 'Source', sortValue: (i) => i.source, render: (i) => <span className="font-mono text-xs text-dim">{i.source}</span> },
    { key: 'kind', header: 'Kind', sortValue: (i) => i.kind, render: (i) => <Chip tone="neutral" dot={false}>{i.kind}</Chip> },
    { key: 'symbols', header: 'Symbols', render: (i) => <span className="font-mono text-xs text-faint">{i.symbols.join(', ')}</span> },
  ];

  const structure = (
    <div className="space-y-4">
      <Panel title="Functions" subtitle="Sortable by any column. High-complexity entries are the strongest refactor candidates." flush>
        <DataTable columns={fnColumns} rows={file.structure.functions} rowKey={(f) => f.name} defaultSort={{ key: 'complexity', dir: 'desc' }} ariaLabel="Functions" minTableWidth={520} />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Classes">
          <ul className="divide-y divide-edge-soft/60 text-13">
            {file.structure.classes.map((c) => (
              <li key={c.name} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span className="font-mono text-xs text-ink">{c.name}</span>
                <span className="font-mono text-2xs text-faint">
                  {c.loc} LOC · {c.methods} methods
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Imports & Dependencies" flush>
          <DataTable columns={impColumns} rows={file.structure.imports} rowKey={(i) => i.source} ariaLabel="Imports" minTableWidth={380} />
        </Panel>
      </div>
    </div>
  );

  /* ---------------------------- Git history ----------------------------- */

  const histColumns: Column<FileCommit>[] = [
    { key: 'hash', header: 'Commit', sortValue: (c) => c.hash, render: (c) => <span className="font-mono text-xs text-accent">{c.hash}</span> },
    { key: 'date', header: 'Date', sortValue: (c) => c.date, render: (c) => <span className="font-mono text-xs text-dim">{fmtDate(c.date)}</span> },
    { key: 'type', header: 'Type', sortValue: (c) => c.type, render: (c) => <Chip tone={TYPE_TONE[c.type] ?? 'neutral'}>{c.type}</Chip> },
    { key: 'message', header: 'Changes', render: (c) => (
        <span className="font-mono text-xs tabular-nums">
          <span className="text-ok">+{fmtInt(c.added)}</span> <span className="text-crit">−{fmtInt(c.deleted)}</span>
          <span className="ml-2 text-faint">{c.message}</span>
        </span>
      ) },
    { key: 'author', header: 'Author', sortValue: (c) => c.author, render: (c) => <span className="text-xs text-dim">{c.author}</span> },
  ];

  const history = (
    <Panel title="Commit History" subtitle={`${file.revisions} revisions touch this file.`} flush>
      <DataTable columns={histColumns} rows={file.history} rowKey={(c) => c.hash + c.date} defaultSort={{ key: 'date', dir: 'desc' }} pageSize={10} ariaLabel="File commit history" minTableWidth={760} />
      <div className="px-4 pb-3">
        <SignalNote>
          Authors are listed for traceability only. This product analyzes repository evidence and does
          not rank or evaluate contributors.
        </SignalNote>
      </div>
    </Panel>
  );

  /* ------------------------------ Findings ------------------------------ */

  const debtColumns: Column<FileDebtMarker>[] = [
    { key: 'line', header: 'Line', align: 'right', sortValue: (d) => d.line, render: (d) => <span className="font-mono tabular-nums text-dim">:{d.line}</span> },
    { key: 'type', header: 'Type', sortValue: (d) => d.type, render: (d) => <Chip tone={d.severity === 'critical' || d.severity === 'high' ? 'high' : 'neutral'} dot={false}>{d.type}</Chip> },
    { key: 'severity', header: 'Severity', sortValue: (d) => d.ageDays, render: (d) => <SeverityBadge severity={d.severity} /> },
    { key: 'age', header: 'Age', align: 'right', sortValue: (d) => d.ageDays, render: (d) => <span className="font-mono tabular-nums text-dim">{d.ageDays} days</span> },
    { key: 'text', header: 'Description', render: (d) => <span className="text-xs text-dim">{d.text}</span> },
  ];

  const findings = (
    <div className="space-y-4">
      {file.findings.length === 0 && file.debt.length === 0 ? (
        <Panel>
          <EmptyState
            title="No file-specific findings"
            message="Static analysis and Git forensics did not identify findings specific to this file beyond the signals above."
          />
        </Panel>
      ) : (
        <>
          {file.findings.length > 0 && (
            <div className="space-y-3">
              {file.findings.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          )}
          {file.debt.length > 0 && (
            <Panel title="Debt Markers in This File" flush>
              <DataTable columns={debtColumns} rows={file.debt} rowKey={(d) => `${d.line}-${d.type}`} defaultSort={{ key: 'age', dir: 'desc' }} ariaLabel="File debt markers" minTableWidth={680} />
            </Panel>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        back={{ to: `/repository/${repoId}/hotspots`, label: 'Hotspots' }}
        title={file.path}
        meta={
          <>
            <span>{file.language}</span>
            <span className="font-mono">{fmtInt(file.loc)} LOC</span>
            <span className="font-mono">{file.revisions} revisions</span>
            <span>{file.module}</span>
          </>
        }
        actions={
          <div className="flex items-center gap-2.5 rounded-md border border-edge bg-surface px-3 py-2">
            <span className="text-2xs uppercase tracking-wider text-faint">Risk</span>
            <span className="text-[22px] font-semibold leading-none tabular-nums text-ink">
              {file.risk}
              <span className="text-faint"> / 100</span>
            </span>
            <SeverityBadge severity={file.riskSeverity} />
          </div>
        }
      />

      <p className="max-w-3xl text-xs leading-relaxed text-faint">{file.summary}</p>

      <TabBar
        ariaLabel="File investigation sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'structure', label: 'Code Structure' },
          { value: 'history', label: 'Git History' },
          { value: 'findings', label: 'Findings' },
        ]}
      />

      <div>
        {tab === 'overview' && overview}
        {tab === 'structure' && structure}
        {tab === 'history' && history}
        {tab === 'findings' && findings}
      </div>
    </div>
  );
}

function fmtSignedLocal(n: number): string {
  return `${n >= 0 ? '+' : '−'}${fmtInt(Math.abs(n))}`;
}
