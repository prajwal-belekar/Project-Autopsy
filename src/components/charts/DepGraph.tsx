import { useMemo, useState } from 'react';
import type { ArchModule, CircularDependency } from '../../types';
import { Chip } from '../common/Badge';

const COL_W = 200;
const NODE_W = 172;
const NODE_H = 48;
const GAP_Y = 20;
const TOP = 34;
const PAD_X = 12;
const LAYERS = ['UI', 'Services', 'API', 'Data', 'Shared', 'Workers'];

const truncate = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/**
 * Layered module dependency graph. Nodes are detected modules; edges are
 * detected dependencies. Circular dependencies are highlighted in orange.
 */
export function DepGraph({
  modules,
  circular,
}: {
  modules: ArchModule[];
  circular: CircularDependency[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = hover ?? selected;

  const { positions, width, height, usedLayers } = useMemo(() => {
    const byLayer = new Map<string, ArchModule[]>();
    LAYERS.forEach((l) => byLayer.set(l, []));
    modules.forEach((m) => byLayer.get(m.layer)?.push(m));
    const used = LAYERS.filter((l) => (byLayer.get(l)?.length ?? 0) > 0);
    const pos = new Map<string, { x: number; y: number }>();
    let maxRows = 1;
    used.forEach((layer, ci) => {
      const list = byLayer.get(layer) ?? [];
      maxRows = Math.max(maxRows, list.length);
      list.forEach((m, ri) => {
        pos.set(m.id, { x: PAD_X + ci * COL_W, y: TOP + ri * (NODE_H + GAP_Y) });
      });
    });
    return {
      positions: pos,
      usedLayers: used,
      width: PAD_X * 2 + used.length * COL_W,
      height: TOP + maxRows * (NODE_H + GAP_Y),
    };
  }, [modules]);

  const cycleIds = useMemo(() => new Set(circular.flatMap((c) => c.cycle)), [circular]);
  const cyclePairs = useMemo(
    () => new Set(circular.flatMap((c) => [c.cycle.join('|'), [...c.cycle].reverse().join('|')])),
    [circular],
  );

  const edges = useMemo(() => {
    const list: { from: ArchModule; to: ArchModule; isCycle: boolean }[] = [];
    modules.forEach((m) =>
      m.dependsOn.forEach((dep) => {
        const target = modules.find((x) => x.id === dep);
        if (!target) return;
        list.push({ from: m, to: target, isCycle: cyclePairs.has(`${m.id}|${dep}`) });
      }),
    );
    return list;
  }, [modules, cyclePairs]);

  const relatedTo = (id: string): Set<string> => {
    const s = new Set<string>();
    const m = modules.find((x) => x.id === id);
    if (m) m.dependsOn.forEach((d) => s.add(d));
    modules.forEach((o) => {
      if (o.dependsOn.includes(id)) s.add(o.id);
    });
    return s;
  };
  const activeSet = active ? relatedTo(active) : null;
  const selectedModule = modules.find((m) => m.id === selected) ?? null;
  const dependentsOf = (id: string): string[] =>
    modules.filter((m) => m.dependsOn.includes(id)).map((m) => m.name);

  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-edge-soft bg-canvas">
        <svg width={width} height={height} role="img" aria-label="Module dependency graph">
          <defs>
            <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" fill="#3A4756" />
            </marker>
            <marker id="arrow-accent" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" fill="#22D3EE" />
            </marker>
            <marker id="arrow-cycle" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" fill="#F97316" />
            </marker>
          </defs>

          {usedLayers.map((layer, ci) => (
            <text
              key={layer}
              x={PAD_X + ci * COL_W + 2}
              y={18}
              fontSize={10}
              fill="#6B7785"
              fontFamily='"JetBrains Mono", monospace'
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              {layer.toUpperCase()}
            </text>
          ))}

          {edges.map((e, i) => {
            const p1 = positions.get(e.from.id);
            const p2 = positions.get(e.to.id);
            if (!p1 || !p2) return null;
            const x1 = p1.x + NODE_W;
            const y1 = p1.y + NODE_H / 2;
            const x2 = p2.x;
            const y2 = p2.y + NODE_H / 2;
            const mx = (x1 + x2) / 2;
            const lit = active !== null && (e.from.id === active || e.to.id === active);
            const dim = active !== null && !lit;
            const stroke = e.isCycle ? '#F97316' : lit ? '#22D3EE' : '#3A4756';
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={stroke}
                strokeWidth={e.isCycle || lit ? 1.5 : 1.1}
                strokeDasharray={e.isCycle ? '5 4' : undefined}
                opacity={dim ? 0.15 : 0.85}
                markerEnd={`url(#${e.isCycle ? 'arrow-cycle' : lit ? 'arrow-accent' : 'arrow'})`}
              />
            );
          })}

          {modules.map((m) => {
            const p = positions.get(m.id);
            if (!p) return null;
            const dim = activeSet !== null && m.id !== active && !activeSet.has(m.id);
            const inCycle = cycleIds.has(m.id);
            const stroke = m.id === active ? '#22D3EE' : inCycle ? 'rgba(249,115,22,0.55)' : '#27313D';
            return (
              <g
                key={m.id}
                transform={`translate(${p.x}, ${p.y})`}
                opacity={dim ? 0.3 : 1}
                onMouseEnter={() => setHover(m.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected((s) => (s === m.id ? null : m.id))}
                className="cursor-pointer"
                role="button"
                aria-label={`${m.name}: ${m.layer} layer, ${m.files} files`}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={6}
                  fill="#151B23"
                  stroke={stroke}
                  strokeWidth={m.id === active ? 1.6 : 1}
                />
                <text x={12} y={20} fontSize={11.5} fill="#F3F4F6" fontFamily='"JetBrains Mono", monospace'>
                  {truncate(m.name, 21)}
                </text>
                <text x={12} y={35} fontSize={9.5} fill="#6B7785" fontFamily='"JetBrains Mono", monospace'>
                  {m.files} files · {(m.loc / 1000).toFixed(1)}k LOC
                </text>
                {inCycle && <circle cx={NODE_W - 10} cy={12} r={3} fill="#F97316" />}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-faint">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-px w-5 bg-[#3A4756]" /> dependency
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-px w-5 border-t border-dashed border-high" /> circular dependency
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2 rounded-full bg-high" /> module participates in a cycle
        </span>
        <span>Hover a module to trace its dependencies · click to pin details.</span>
      </div>

      {selectedModule && (
        <div className="mt-3 rounded-md border border-edge-soft bg-panel p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-13 font-medium text-ink">{selectedModule.name}</span>
            <Chip tone="neutral" dot={false}>
              {selectedModule.layer}
            </Chip>
            <span className="text-2xs text-faint">
              {selectedModule.files} files · {selectedModule.loc.toLocaleString('en-US')} LOC · fan-in{' '}
              {dependentsOf(selectedModule.id).length} · fan-out {selectedModule.dependsOn.length}
            </span>
          </div>
          <div className="mt-2.5 grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <span className="text-2xs uppercase tracking-wider text-faint">Depends on</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {selectedModule.dependsOn.map((d) => (
                  <span key={d} className="rounded border border-edge-soft bg-surface px-1.5 py-0.5 font-mono text-2xs text-dim">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-2xs uppercase tracking-wider text-faint">Dependents</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {dependentsOf(selectedModule.id).length === 0 ? (
                  <span className="text-2xs text-faint">none</span>
                ) : (
                  dependentsOf(selectedModule.id).map((d) => (
                    <span key={d} className="rounded border border-edge-soft bg-surface px-1.5 py-0.5 font-mono text-2xs text-dim">
                      {d}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
