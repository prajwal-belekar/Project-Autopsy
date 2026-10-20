import type { HealthData, PrimaryFinding } from '../types';

export const health: HealthData = {
  overall: 72,
  status: 'Needs Attention',
  statusSeverity: 'medium',
  methodology:
    'Scores are computed from deterministic repository signals only — Git metadata, static structure analysis, and marker scanning. No AI is involved in scoring. Each sub-score aggregates a defined set of signals; see the methodology notes on each page for calculation details.',
  metrics: [
    {
      label: 'Code Health',
      score: 78,
      status: 'Good',
      severity: 'low',
      hint: 'Maintainability, complexity, duplication, and error-handling signals from static analysis.',
    },
    {
      label: 'Architecture',
      score: 71,
      status: 'Fair',
      severity: 'medium',
      hint: 'Module boundaries, dependency direction, and circular-dependency signals from the import graph.',
    },
    {
      label: 'Testing',
      score: 54,
      status: 'Weak',
      severity: 'high',
      hint: 'Test-to-source ratio, test activity over time, and test coverage of high-risk areas.',
    },
    {
      label: 'Documentation',
      score: 63,
      status: 'Fair',
      severity: 'medium',
      hint: 'Presence of README, setup, API, and architecture documentation, plus inline comment coverage.',
    },
    {
      label: 'Technical Debt',
      score: 48,
      status: 'Weak',
      severity: 'high',
      hint: 'Debt marker density (TODO/FIXME/HACK), large functions, duplication, and deprecated usage.',
    },
    {
      label: 'Development Friction',
      score: 69,
      status: 'High',
      severity: 'high',
      hint: 'Composite of churn, change frequency, bug-fix activity, rework, complexity, coupling, and testing signals.',
    },
  ],
};

export const primaryFinding: PrimaryFinding = {
  area: 'Authentication',
  filePath: 'src/auth/AuthProvider.tsx',
  summary: 'High development friction',
  severity: 'high',
  evidence: [
    { label: 'Revisions', value: '22' },
    { label: 'Lines added', value: '850', tone: 'neutral' },
    { label: 'Lines deleted', value: '710', tone: 'neutral' },
    { label: 'Bug-fix commits', value: '9', tone: 'high' },
    { label: 'Reverts', value: '3', tone: 'high' },
    { label: 'Complexity', value: '24', tone: 'high' },
    { label: 'Test activity', value: 'Low', tone: 'high' },
  ],
};
