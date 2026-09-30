import type { DebtData } from '../types';

export const debt: DebtData = {
  counts: {
    todo: 43,
    fixme: 18,
    hack: 7,
    largeFunctions: 12,
    duplication: 9,
    deprecated: 5,
  },
  note: 'Ages are computed from the earliest commit containing the marker — not estimated. Register shows the highest-severity entries of 94 identified markers.',
  register: [
    { id: 'd1', location: 'src/auth/AuthProvider.tsx', line: 214, type: 'TODO', severity: 'high', ageDays: 142, description: 'State reset issue noted in source — resetAuthState() does not clear the provider cache on token rotation.' },
    { id: 'd2', location: 'src/payments/PaymentProcessor.ts', line: 88, type: 'FIXME', severity: 'critical', ageDays: 96, description: 'Retry loop may double-charge on gateway timeout; needs idempotency key.' },
    { id: 'd3', location: 'src/components/Dashboard.tsx', line: 402, type: 'HACK', severity: 'medium', ageDays: 61, description: 'Layout patch for Safari grid overflow; replace with container queries.' },
    { id: 'd4', location: 'src/api/client.ts', line: 57, type: 'TODO', severity: 'medium', ageDays: 88, description: 'Hardcoded pagination limit of 100; should read from response metadata.' },
    { id: 'd5', location: 'src/sync/ConflictResolver.ts', line: 130, type: 'FIXME', severity: 'high', ageDays: 45, description: 'Merge strategy for concurrent deletes unresolved; last-writer wins is unsafe here.' },
    { id: 'd6', location: 'src/utils/date.ts', line: 12, type: 'Deprecated Usage', severity: 'low', ageDays: 210, description: 'Falls back to a deprecated Intl API for Node < 18; drop after runtime bump.' },
    { id: 'd7', location: 'src/api/client.ts + src/services/sync/client.ts', line: 1, type: 'Duplication', severity: 'medium', ageDays: 120, description: 'Retry/backoff helper duplicated in two modules (58 identical lines).' },
    { id: 'd8', location: 'src/payments/PaymentProcessor.ts → processPayment()', line: 74, type: 'Large Function', severity: 'high', ageDays: 96, description: '118 LOC, cyclomatic complexity 11 — extract gateway-specific branches.' },
    { id: 'd9', location: 'src/auth/AuthProvider.tsx → mapProviderError()', line: 156, type: 'HACK', severity: 'medium', ageDays: 77, description: 'Temporary shim re-ordering Safari storage events before state restore.' },
    { id: 'd10', location: 'src/state/store.ts', line: 245, type: 'TODO', severity: 'low', ageDays: 33, description: 'Migrate legacy selector pattern to the new slice API.' },
    { id: 'd11', location: 'src/db/migrations.ts → applyMigrations()', line: 41, type: 'Large Function', severity: 'medium', ageDays: 124, description: '71 LOC mixing migration discovery, execution, and logging.' },
    { id: 'd12', location: 'src/api/routes/webhooks.ts', line: 96, type: 'FIXME', severity: 'high', ageDays: 52, description: 'Signature verification skips replay-window check for legacy senders.' },
    { id: 'd13', location: 'src/components/Dashboard.tsx → DashboardGrid (render)', line: 118, type: 'Large Function', severity: 'medium', ageDays: 61, description: '84 LOC render body; split widget registration from layout.' },
    { id: 'd14', location: 'src/workers/exportWorker.ts', line: 22, type: 'Deprecated Usage', severity: 'low', ageDays: 150, description: 'Uses deprecated FileReader API; migrate to Blob streams.' },
  ],
};
