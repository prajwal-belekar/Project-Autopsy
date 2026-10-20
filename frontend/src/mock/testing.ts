import type { TestingData } from '../types';

export const testing: TestingData = {
  testFiles: 42,
  sourceFiles: 184,
  ratioPct: 22.8,
  suites: [
    { name: 'Unit Testing', status: 'available', evidence: 'Vitest config detected · 38 spec files match source modules.' },
    { name: 'Integration Testing', status: 'available', evidence: '11 integration specs detected under tests/integration.' },
    { name: 'E2E Testing', status: 'partial', evidence: 'Playwright config detected · 3 specs; critical flows (auth, payments) not covered.' },
    { name: 'CI Test Execution', status: 'available', evidence: 'GitHub Actions workflow runs unit + integration on every push.' },
  ],
  activity: [
    { month: 'Oct 25', testCommits: 3, testFiles: 4 },
    { month: 'Nov 25', testCommits: 5, testFiles: 6 },
    { month: 'Dec 25', testCommits: 6, testFiles: 7 },
    { month: 'Jan 26', testCommits: 14, testFiles: 9 },
    { month: 'Feb 26', testCommits: 11, testFiles: 10 },
    { month: 'Mar 26', testCommits: 9, testFiles: 11 },
    { month: 'Apr 26', testCommits: 7, testFiles: 12 },
    { month: 'May 26', testCommits: 12, testFiles: 14 },
    { month: 'Jun 26', testCommits: 16, testFiles: 17 },
    { month: 'Jul 26', testCommits: 8, testFiles: 18 },
    { month: 'Aug 26', testCommits: 6, testFiles: 18 },
    { month: 'Sep 26', testCommits: 4, testFiles: 19 },
  ],
  riskAreas: [
    { path: 'src/auth/AuthProvider.tsx', module: 'Authentication', risk: 91, complexity: 24, testSignal: 'low', churn: 'high' },
    { path: 'src/payments/PaymentProcessor.ts', module: 'Payments', risk: 83, complexity: 21, testSignal: 'low', churn: 'high' },
    { path: 'src/components/Dashboard.tsx', module: 'UI', risk: 84, complexity: 19, testSignal: 'low', churn: 'high' },
    { path: 'src/api/client.ts', module: 'API', risk: 76, complexity: 14, testSignal: 'low', churn: 'medium' },
    { path: 'src/sync/ConflictResolver.ts', module: 'Sync', risk: 71, complexity: 18, testSignal: 'low', churn: 'medium' },
    { path: 'src/api/routes/webhooks.ts', module: 'API', risk: 58, complexity: 11, testSignal: 'low', churn: 'medium' },
  ],
  note: 'Coverage percentages are not shown because no coverage reports were present in the analysis run. Test signal reflects observed test-file activity, not measured coverage.',
};
