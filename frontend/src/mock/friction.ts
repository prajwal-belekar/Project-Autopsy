import type { FrictionData } from '../types';
import { mulberry32 } from '../utils/series';

function genSeries(): FrictionData['series'] {
  const rnd = mulberry32(42);
  const pts: FrictionData['series'] = [];
  const end = new Date('2026-09-19T00:00:00Z');
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const t = (364 - i) / 364;
    const base = 52 + 22 * t;
    const wave = 6 * Math.sin(t * Math.PI * 2.2 + 1);
    const noise = (rnd() - 0.5) * 9;
    // Friction spikes align with the Mar auth refactor, Jun payments overhaul, Sep auth rework.
    const bump =
      10 * Math.exp(-((t - 0.45) ** 2) / 0.002) +
      8 * Math.exp(-((t - 0.66) ** 2) / 0.002) +
      9 * Math.exp(-((t - 0.97) ** 2) / 0.001);
    const score = Math.max(20, Math.min(95, Math.round(base + wave + noise + bump)));
    pts.push({ date: d.toISOString().slice(0, 10), score });
  }
  return pts;
}

export const friction: FrictionData = {
  score: 69,
  level: 'high',
  description:
    'Composite signal derived from repository activity, code change patterns, structural complexity, rework, and testing signals.',
  series: genSeries(),
  factors: [
    {
      name: 'Code Churn',
      level: 'high',
      tone: 'high',
      score: 78,
      weightPct: 25,
      description: 'Lines added and deleted relative to file size over the trailing 90 days.',
      source: 'git diff statistics',
    },
    {
      name: 'Change Frequency',
      level: 'high',
      tone: 'high',
      score: 74,
      weightPct: 20,
      description: 'Concentration of commits and revisions per module over time.',
      source: 'git log metadata',
    },
    {
      name: 'Bug-Fix Activity',
      level: 'high',
      tone: 'high',
      score: 71,
      weightPct: 15,
      description: 'Commits classified as bug fixes that reference the area.',
      source: 'commit classification',
    },
    {
      name: 'Rework / Reverts',
      level: 'moderate',
      tone: 'warn',
      score: 58,
      weightPct: 15,
      description: 'Revert commits and repeated re-modification of recently changed code.',
      source: 'git log metadata',
    },
    {
      name: 'Complexity',
      level: 'high',
      tone: 'high',
      score: 68,
      weightPct: 10,
      description: 'Cyclomatic complexity of functions within the area.',
      source: 'static analysis',
    },
    {
      name: 'Coupling',
      level: 'moderate',
      tone: 'warn',
      score: 52,
      weightPct: 10,
      description: 'Fan-in and fan-out of module dependencies in the import graph.',
      source: 'import graph',
    },
    {
      name: 'Testing Activity',
      level: 'low',
      tone: 'high',
      score: 34,
      weightPct: 5,
      description: 'Test commits and test-file changes touching the area. Low activity limits safe change.',
      source: 'git log + test file mapping',
    },
  ],
  weights: [
    { factor: 'Code churn', pct: 25 },
    { factor: 'Change frequency', pct: 20 },
    { factor: 'Bug-fix activity', pct: 15 },
    { factor: 'Rework / reverts', pct: 15 },
    { factor: 'Complexity', pct: 10 },
    { factor: 'Coupling', pct: 10 },
    { factor: 'Testing signal', pct: 5 },
  ],
  note: 'These weights are configurable project parameters and are not universal industry standards.',
};
