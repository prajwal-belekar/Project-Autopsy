import type { Finding, Recommendation } from '../types';

export const findings: Finding[] = [
  {
    id: 'auth-friction',
    title: 'Authentication shows high development friction',
    area: 'Authentication',
    severity: 'high',
    observation:
      'The authentication module changed frequently while structural complexity remained high and test activity stayed low.',
    evidence: [
      '22 revisions of src/auth/AuthProvider.tsx (highest in the repository)',
      'High churn: 850 lines added, 710 lines deleted',
      '9 bug-fix commits reference this file',
      '3 revert commits, including one full revert of a state-machine simplification',
      'Cyclomatic complexity 24 (repository threshold: 20)',
      'Low test activity: no test commits touch this file in the last 90 days',
    ],
    impact:
      'Repeated changes combined with structural complexity may increase maintenance risk. A defect in this module affects every authenticated flow, and the low testing signal reduces the ability to change it safely.',
    recommendation:
      'Consider separating authentication responsibilities (token handling, provider mapping, session persistence) and increasing integration-test coverage before further behavioral changes.',
    evidenceLink: {
      label: 'View Evidence — File Investigation',
      to: 'file/src/auth/AuthProvider.tsx',
    },
    aiInterpretation: {
      text: 'The concentration of revisions, reverts, and bug fixes in a single high-complexity file is a pattern consistent with a module whose responsibilities have outgrown its boundaries. The persistent absence of test activity suggests changes to this area carry unverifiable risk. This interpretation is derived solely from the deterministic signals listed above.',
      disclaimer:
        'AI interpretation — generated from the deterministic signals above only. No metrics, commits, or causes are inferred beyond the listed evidence.',
    },
  },
  {
    id: 'payment-double-charge',
    title: 'Payment retry path carries a critical debt marker',
    area: 'Payments',
    severity: 'high',
    observation:
      'A FIXME marker in the payment retry loop describes a possible double-charge on gateway timeout, corroborated by issue #419.',
    evidence: [
      'FIXME at src/payments/PaymentProcessor.ts:88, open 96 days',
      'Issue #419 “Payment retry can double-charge on gateway timeout” — 9 linked commits',
      '14 revisions and 7 bug-fix commits on this file',
      'processPayment(): 118 LOC, cyclomatic complexity 11',
    ],
    impact:
      'A confirmed defect path in payment execution carries direct business risk and is the highest-severity debt marker in the repository.',
    recommendation:
      'Add idempotency keys to the retry loop and add an integration test that exercises gateway timeout during charge submission.',
    evidenceLink: {
      label: 'View Evidence — Technical Debt Register',
      to: 'debt',
    },
  },
  {
    id: 'circular-deps',
    title: 'Three circular dependencies violate the layered structure',
    area: 'Architecture',
    severity: 'high',
    observation:
      'Import-direction analysis detected three cycles; two cross layer boundaries between API, Data, and UI-state modules.',
    evidence: [
      'api/client ↔ db/cache — introduced 2026-02-17',
      'services/sync ↔ ui/state — introduced 2026-04-02',
      'shared/utils ↔ db/core — introduced 2025-12-08',
      'Module dependency graph shows 27 edges; 3 form cycles',
    ],
    impact:
      'Circular dependencies make module initialization order fragile, complicate testing in isolation, and tend to spread coupling as the codebase grows.',
    recommendation:
      'Introduce an interface or event boundary at each cycle — particularly the sync → ui/state edge — and enforce layering with an import lint rule.',
    evidenceLink: {
      label: 'View Evidence — Architecture Graph',
      to: 'architecture',
    },
  },
  {
    id: 'untested-risk',
    title: 'High-risk areas have limited test activity',
    area: 'Testing',
    severity: 'medium',
    observation:
      'Five of the six highest-risk files show low test signal while the overall test-to-source ratio is 22.8%.',
    evidence: [
      'AuthProvider.tsx — risk 91, test signal low',
      'Dashboard.tsx — risk 84, test signal low',
      'PaymentProcessor.ts — risk 83, test signal low',
      'api/client.ts — risk 76, test signal low',
      'Test commits concentrated in Jan–Jun; declining since July',
    ],
    impact:
      'Risk concentrates where change frequency and complexity are highest, precisely where tests provide the most protection. The current distribution leaves the riskiest code least protected.',
    recommendation:
      'Prioritize integration tests for the top hotspots (auth and payments first) before new feature work in those modules.',
    evidenceLink: {
      label: 'View Evidence — Testing Health',
      to: 'testing',
    },
  },
  {
    id: 'docs-gaps',
    title: 'API and environment documentation are not detected',
    area: 'Documentation',
    severity: 'medium',
    observation:
      'No API reference artifacts were found, and environment variables are not documented beyond an .env.example file.',
    evidence: [
      'No OpenAPI spec, typedoc config, or API reference detected',
      '.env.example present; required variables undocumented',
      'docs/architecture.md covers 2 of 5 major modules',
      '41% of exported symbols carry doc comments',
    ],
    impact:
      'Onboarding cost increases and API misuse becomes more likely as the contributor set grows. Architecture drift is harder to detect without reference documentation.',
    recommendation:
      'Generate API documentation from the existing TypeScript types and document required environment variables next to the .env.example file.',
    evidenceLink: {
      label: 'View Evidence — Documentation',
      to: 'documentation',
    },
  },
  {
    id: 'stall-signals',
    title: 'Activity gaps precede large change sets in three periods',
    area: 'Git Forensics',
    severity: 'low',
    observation:
      'Three periods of unusually low repository activity were each followed by substantial repository changes.',
    evidence: [
      'Mar 10–15: 5 inactive days → 1,200 lines (Authentication)',
      'Jun 02–09: 7 inactive days → 2,050 lines (Payments)',
      'Aug 18–22: 4 inactive days → 860 lines (Sync)',
    ],
    impact:
      'Large change sets following quiet periods correlate with harder-to-review integration. This is an observable pattern and does not establish intent or cause.',
    recommendation:
      'No immediate action required. Consider smaller, more incremental delivery in the affected modules to keep review size manageable.',
    evidenceLink: {
      label: 'View Evidence — Development Stall Signals',
      to: 'git',
    },
  },
];

export const recommendations: Recommendation[] = [
  {
    id: 'rec-1',
    priority: 'P0',
    priorityLabel: 'Immediate engineering attention',
    issue: 'Payment retry loop may double-charge on gateway timeout',
    evidence: ['FIXME at PaymentProcessor.ts:88 (96 days old)', 'Issue #419 with 9 linked commits'],
    action: 'Add idempotency keys to the charge retry path and cover it with a gateway-timeout integration test.',
    benefit: 'Removes the highest-severity defect path in the codebase and protects revenue integrity.',
    findingId: 'payment-double-charge',
  },
  {
    id: 'rec-2',
    priority: 'P0',
    priorityLabel: 'Immediate engineering attention',
    issue: 'Circular dependencies across API/Data and Services/UI-state boundaries',
    evidence: ['3 cycles detected', '2 cross layer boundaries', 'oldest open since 2025-12-08'],
    action: 'Break cycles at api/client ↔ db/cache and services/sync ↔ ui/state using interface or event boundaries; add an import-lint rule to prevent regressions.',
    benefit: 'Restores layering, reduces coupling spread, and makes the affected modules testable in isolation.',
    findingId: 'circular-deps',
  },
  {
    id: 'rec-3',
    priority: 'P1',
    priorityLabel: 'Recommended improvement',
    issue: 'AuthProvider concentrates auth responsibilities behind high complexity',
    evidence: ['22 revisions', 'complexity 24', '9 bug fixes', '3 reverts', 'low test signal'],
    action: 'Split token handling, provider mapping, and session persistence into separate modules; add integration tests before further behavior changes.',
    benefit: 'Lowers the friction score drivers (complexity, churn, rework) and makes authentication changes verifiable.',
    findingId: 'auth-friction',
  },
  {
    id: 'rec-4',
    priority: 'P1',
    priorityLabel: 'Recommended improvement',
    issue: 'Highest-risk files have the least test activity',
    evidence: ['5 of 6 top-risk files show low test signal', 'test commits declining since July'],
    action: 'Stand up integration tests for AuthProvider, PaymentProcessor, and api/client as the next testing milestone.',
    benefit: 'Directs test investment to the code where defects have historically clustered.',
    findingId: 'untested-risk',
  },
  {
    id: 'rec-5',
    priority: 'P2',
    priorityLabel: 'Long-term improvement',
    issue: 'No API documentation artifacts detected',
    evidence: ['No OpenAPI/typedoc', '41% documented exports'],
    action: 'Generate reference docs from TypeScript types in CI and document required environment variables.',
    benefit: 'Reduces onboarding cost and API misuse as the contributor base grows.',
    findingId: 'docs-gaps',
  },
  {
    id: 'rec-6',
    priority: 'P2',
    priorityLabel: 'Long-term improvement',
    issue: 'Debt register accumulates markers without a grooming cadence',
    evidence: ['94 markers', 'average marker age 84 days', 'oldest 210 days'],
    action: 'Review the register each planning cycle; time-box fixes for high-severity markers and delete obsolete ones.',
    benefit: 'Keeps technical debt visible and actionable instead of accumulating silently.',
    findingId: undefined,
  },
];
