import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Panel } from '../../components/common/Panel';
import { PageSkeleton } from '../../components/common/Skeleton';
import { LevelBadge } from '../../components/common/Badge';
import { InfoTip } from '../../components/common/InfoTip';
import { RangeTabs } from '../../components/common/Tabs';
import { CollapsibleSection } from '../../components/common/Collapsible';
import { WeightsTable } from '../../components/evidence/Evidence';
import { TrendChart } from '../../components/charts/TrendChart';
import { useFriction, useHotspots } from '../../hooks/useQueries';
import { sliceRange, type RangeKey } from '../../utils/series';
import { fmtDay, fmtInt } from '../../utils/format';
import { toneHex } from '../../utils/severity';

export default function Friction() {
  const { repoId = '' } = useParams();
  const { data: fr, isLoading } = useFriction(repoId);
  const hotspots = useHotspots(repoId);
  const [range, setRange] = useState<RangeKey>('6M');

  const series = useMemo(
    () => (fr ? sliceRange(fr.series, range, 120) : []),
    [fr, range],
  );

  if (isLoading || !fr) return <PageSkeleton />;

  const related = (hotspots.data ?? [])
    .filter((h) => h.churnLevel === 'high' && h.revisions >= 8)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Development Friction"
        meta={<span className="max-w-3xl leading-relaxed">{fr.description}</span>}
        actions={
          <div className="flex items-center gap-2.5 rounded-md border border-edge bg-surface px-3 py-2">
            <span className="text-[26px] font-semibold leading-none tabular-nums text-ink">{fr.score}</span>
            <span className="text-2xs text-faint">/ 100</span>
            <LevelBadge level={fr.level} />
          </div>
        }
      />

      <Panel title="Development Friction Over Time" actions={<RangeTabs value={range} onChange={setRange} />}>
        <TrendChart
          data={series}
          xKey="date"
          height={280}
          yDomain={[0, 100]}
          series={[{ key: 'score', label: 'Friction score', color: '#22D3EE', area: true }]}
          xTickFormatter={(d) => fmtDay(d)}
          valueFormatter={(v) => `${v} / 100`}
        />
      </Panel>

      <Panel
        title="Contributing Factors"
        subtitle="Each factor is derived from an observable repository signal. Hover a factor to see its source."
      >
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {fr.factors.map((f) => (
            <li key={f.name} className="rounded-md border border-edge-soft bg-panel p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-13 font-medium text-ink">
                  {f.name}
                  <InfoTip label={`${f.name} — signal source`}>
                    {f.description}
                    <span className="mt-1 block font-mono text-[10px] text-faint">Source: {f.source}</span>
                  </InfoTip>
                </span>
                <LevelBadge level={f.level} />
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div
                  className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-edge-soft"
                  role="meter"
                  aria-valuenow={f.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={f.name}
                >
                  <div className="h-full rounded-full" style={{ width: `${f.score}%`, backgroundColor: toneHex[f.tone] }} />
                </div>
                <span className="shrink-0 font-mono text-2xs tabular-nums text-faint">{f.weightPct}% weight</span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Methodology" subtitle="Scoring weights are transparent and configurable.">
        <CollapsibleSection title="How is Development Friction calculated?">
          <div className="space-y-3">
            <p className="max-w-3xl text-xs leading-relaxed text-dim">
              The friction score is a weighted composite of the seven factors above, normalized to
              0–100. Factor scores are computed independently from Git metadata, static analysis, and
              the import graph, then combined using the weights below.
            </p>
            <WeightsTable weights={fr.weights} note={fr.note} />
          </div>
        </CollapsibleSection>
      </Panel>

      <Panel
        title="Related Hotspots"
        subtitle="Files with the highest combined churn and revision counts."
      >
        <ul className="divide-y divide-edge-soft/60">
          {related.map((h) => (
            <li key={h.path} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <Link
                to={`/repository/${repoId}/file/${h.path}`}
                className="min-w-0 truncate font-mono text-xs text-dim transition-colors hover:text-accent"
              >
                {h.path}
              </Link>
              <span className="flex shrink-0 items-center gap-3 text-xs text-faint">
                <span className="font-mono">{h.revisions} revisions</span>
                <span className="font-mono">
                  {fmtInt(h.linesAdded)}/{fmtInt(h.linesDeleted)}
                </span>
                <LevelBadge level={h.testSignal} lowIsBad label="tests low" />
                <ArrowRight aria-hidden className="size-3 text-faint" />
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
