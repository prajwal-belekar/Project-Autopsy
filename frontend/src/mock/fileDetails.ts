import type { FileCommit, FileDetails, FileImport, Hotspot } from '../types';
import { hotspots } from './hotspots';
import { findings } from './findings';
import { mulberry32 } from '../utils/series';

/* -------------------- Hand-crafted: AuthProvider -------------------- */

const authProviderHistory: FileCommit[] = [
  { hash: 'a3f9c12', date: '2026-09-16', type: 'Bug Fix', message: 'Reset provider cache on token rotation', added: 84, deleted: 61, author: 'M. Iyer' },
  { hash: '8110feb', date: '2026-09-14', type: 'Chore', message: 'Tighten lint rules for auth module', added: 22, deleted: 18, author: 'S. Chen' },
  { hash: '7b2e8d4', date: '2026-09-08', type: 'Refactor', message: 'Extract scope mapping helpers', added: 120, deleted: 98, author: 'M. Iyer' },
  { hash: 'c41aa09', date: '2026-08-27', type: 'Bug Fix', message: 'Guard against null payload in refresh', added: 38, deleted: 12, author: 'A. Okafor' },
  { hash: '9d6e1b0', date: '2026-08-19', type: 'Chore', message: 'Update provider config types', added: 26, deleted: 9, author: 'S. Chen' },
  { hash: '5d0f771', date: '2026-08-14', type: 'Revert', message: 'Revert "Simplify provider state machine"', added: 210, deleted: 180, author: 'J. Barros' },
  { hash: '99c3b2e', date: '2026-08-14', type: 'Feature', message: 'Simplify provider state machine', added: 190, deleted: 160, author: 'J. Barros' },
  { hash: 'e77d418', date: '2026-07-30', type: 'Bug Fix', message: 'Fix race between refresh and logout', added: 56, deleted: 23, author: 'M. Iyer' },
  { hash: '42af7c5', date: '2026-07-21', type: 'Bug Fix', message: 'Persist session before navigation guard runs', added: 41, deleted: 15, author: 'L. Novak' },
  { hash: 'd81c330', date: '2026-07-09', type: 'Refactor', message: 'Move token decode into worker-safe util', added: 74, deleted: 52, author: 'M. Iyer' },
  { hash: '60bb91e', date: '2026-06-25', type: 'Bug Fix', message: 'Handle expired refresh tokens without logout loop', added: 63, deleted: 28, author: 'R. Kapoor' },
  { hash: '17cf5a8', date: '2026-06-12', type: 'Feature', message: 'Add multi-provider login entry points', added: 155, deleted: 44, author: 'S. Chen' },
  { hash: 'ba29d61', date: '2026-05-28', type: 'Bug Fix', message: 'Restore session on soft reload', added: 48, deleted: 20, author: 'M. Iyer' },
  { hash: '3ce84f7', date: '2026-05-15', type: 'Chore', message: 'Instrument auth timing metrics', added: 35, deleted: 6, author: 'D. Haas' },
  { hash: 'e4c02a9', date: '2026-04-30', type: 'Bug Fix', message: 'Clear stale provider cache on mount', added: 29, deleted: 11, author: 'T. Nguyen' },
  { hash: '71f6d82', date: '2026-04-17', type: 'Refactor', message: 'Split session persistence into SessionManager', added: 210, deleted: 190, author: 'M. Iyer' },
  { hash: '08ad533', date: '2026-04-02', type: 'Bug Fix', message: 'Guard refresh timer against unmount', added: 24, deleted: 8, author: 'S. Chen' },
  { hash: 'cf3e120', date: '2026-03-18', type: 'Refactor', message: 'Extract SessionManager from AuthProvider', added: 320, deleted: 290, author: 'M. Iyer' },
  { hash: '95b7e46', date: '2026-03-11', type: 'Feature', message: 'Add silent refresh window', added: 88, deleted: 30, author: 'J. Barros' },
  { hash: '2d94cb0', date: '2026-02-24', type: 'Bug Fix', message: 'Decode base64url payload correctly', added: 18, deleted: 9, author: 'A. Okafor' },
  { hash: 'f6a1e57', date: '2026-02-10', type: 'Feature', message: 'Initial AuthProvider with token refresh', added: 260, deleted: 40, author: 'M. Iyer' },
  { hash: '1c78d99', date: '2026-01-28', type: 'Chore', message: 'Wire auth provider into app shell', added: 45, deleted: 12, author: 'S. Chen' },
];

const authProvider: FileDetails = {
  path: 'src/auth/AuthProvider.tsx',
  module: 'Authentication',
  language: 'TypeScript',
  loc: 610,
  functions: 18,
  classes: 2,
  imports: 6,
  complexity: 24,
  revisions: 22,
  linesAdded: 850,
  linesDeleted: 710,
  bugFixes: 9,
  reverts: 3,
  risk: 91,
  riskSeverity: 'critical',
  churnLevel: 'high',
  testSignal: 'low',
  debtCount: 4,
  coupling: { afferent: 14, efferent: 8 },
  summary:
    'Authentication provider handling login, token refresh, provider mapping, and session persistence in a single component. This file concentrates the highest revision count, bug-fix count, and revert count in the repository while showing low test activity.',
  structure: {
    functions: [
      { name: 'AuthProvider (render)', loc: 142, complexity: 9, nesting: 4, params: 0 },
      { name: 'useAuthProvider', loc: 68, complexity: 5, nesting: 3, params: 1 },
      { name: 'mapProviderError', loc: 63, complexity: 7, nesting: 3, params: 2 },
      { name: 'refreshSession', loc: 54, complexity: 6, nesting: 2, params: 1 },
      { name: 'exchangeCodeForToken', loc: 44, complexity: 5, nesting: 2, params: 3 },
      { name: 'withAuthRetry', loc: 41, complexity: 6, nesting: 3, params: 2 },
      { name: 'handleCallback', loc: 38, complexity: 5, nesting: 3, params: 2 },
      { name: 'validateTokenPayload', loc: 35, complexity: 5, nesting: 3, params: 1 },
      { name: 'persistSession', loc: 31, complexity: 3, nesting: 2, params: 2 },
      { name: 'restoreFromStorage', loc: 27, complexity: 3, nesting: 2, params: 0 },
      { name: 'scheduleTokenRefresh', loc: 26, complexity: 4, nesting: 3, params: 2 },
      { name: 'buildLoginUrl', loc: 21, complexity: 2, nesting: 2, params: 2 },
      { name: 'resetAuthState', loc: 22, complexity: 4, nesting: 3, params: 0 },
      { name: 'decodeToken', loc: 18, complexity: 2, nesting: 1, params: 1 },
      { name: 'getProviderConfig', loc: 16, complexity: 3, nesting: 2, params: 1 },
      { name: 'mapScopes', loc: 12, complexity: 2, nesting: 2, params: 2 },
      { name: 'isSessionExpired', loc: 11, complexity: 2, nesting: 1, params: 1 },
      { name: 'clearRefreshTimer', loc: 9, complexity: 1, nesting: 1, params: 0 },
    ],
    classes: [
      { name: 'AuthProviderError', loc: 24, methods: 3 },
      { name: 'SessionStore', loc: 58, methods: 6 },
    ],
    imports: [
      { source: 'react', kind: 'import', symbols: ['useCallback', 'useEffect', 'useMemo', 'useState'] },
      { source: '../api/client', kind: 'import', symbols: ['client', 'request'] },
      { source: '../state/store', kind: 'import', symbols: ['useStore'] },
      { source: './sessionKeys', kind: 'type', symbols: ['SessionKeys'] },
      { source: '../utils/date', kind: 'import', symbols: ['isExpired'] },
      { source: '../telemetry/trace', kind: 'dynamic', symbols: ['trace()'] },
    ],
  },
  history: authProviderHistory,
  findings: [
    findings[0],
    {
      id: 'auth-reset-todo',
      title: 'State reset defect noted in source overlaps recurring bug fixes',
      area: 'Authentication',
      severity: 'medium',
      observation: 'A TODO describing an incomplete state reset aligns with the bug-fix history of this file.',
      evidence: [
        'TODO at line 214: provider cache not cleared on token rotation (142 days old)',
        '3 bug-fix commits in the last 60 days touch session lifecycle',
        'Issue #482 “Auth state resets on token refresh” reopened once',
      ],
      impact: 'The recurring bug-fix pattern around session lifecycle suggests the noted reset defect is not yet fully addressed.',
      recommendation: 'Reproduce the token-rotation reset path in a test, then implement the cache clear described in the TODO.',
      evidenceLink: { label: 'View Evidence — Technical Debt', to: 'debt' },
    },
  ],
  debt: [
    { line: 214, type: 'TODO', severity: 'high', ageDays: 142, text: 'State reset issue noted in source — resetAuthState() does not clear provider cache on token rotation.' },
    { line: 88, type: 'FIXME', severity: 'high', ageDays: 96, text: 'Retry wrapper may duplicate side effects; needs idempotency guard.' },
    { line: 156, type: 'HACK', severity: 'medium', ageDays: 61, text: 'Temporary shim re-ordering Safari storage events before state restore.' },
    { line: 271, type: 'TODO', severity: 'low', ageDays: 30, text: 'Remove legacy scope names after migration window closes.' },
  ],
};

/* ---------------- Derived records for remaining files ---------------- */

const FN_POOL = ['handler', 'validate', 'transform', 'serialize', 'process', 'resolve', 'compute', 'apply', 'normalize', 'dispatch', 'hydrate', 'flush'];
const AUTHOR_POOL = ['M. Iyer', 'S. Chen', 'A. Okafor', 'J. Barros', 'L. Novak', 'R. Kapoor', 'D. Haas', 'T. Nguyen'];
const TYPE_POOL: { type: string; w: number }[] = [
  { type: 'Feature', w: 4 },
  { type: 'Bug Fix', w: 3 },
  { type: 'Chore', w: 2 },
  { type: 'Refactor', w: 2 },
  { type: 'Test', w: 1 },
  { type: 'Documentation', w: 1 },
];

function pickType(r: number): string {
  const total = TYPE_POOL.reduce((s, t) => s + t.w, 0);
  let acc = 0;
  for (const t of TYPE_POOL) {
    acc += t.w;
    if (r <= acc / total) return t.type;
  }
  return 'Chore';
}

function deriveFileDetails(h: Hotspot): FileDetails {
  const seed = [...h.path].reduce((s, c) => s * 31 + c.charCodeAt(0), 7) >>> 0;
  const rnd = mulberry32(seed);
  const baseName = h.path.slice(h.path.lastIndexOf('/') + 1, h.path.lastIndexOf('.'));
  const fnCount = Math.max(4, Math.round(h.loc / 45));
  const fnEntries = Array.from({ length: Math.min(fnCount, 18) }, (_, i) => ({
    name: `${baseName.replace(/[^A-Za-z]/g, '')}_${FN_POOL[i % FN_POOL.length]}`,
    loc: Math.max(8, Math.round((h.loc / fnCount) * (0.6 + rnd() * 1.4))),
    complexity: Math.max(1, Math.round(h.complexity / (2 + rnd() * 3))),
    nesting: 1 + Math.floor(rnd() * 4),
    params: Math.floor(rnd() * 4),
  }));
  const history: FileCommit[] = Array.from({ length: Math.min(h.revisions, 14) }, (_, i) => {
    const daysAgo = Math.round(((i + 1) / h.revisions) * 240 + rnd() * 12);
    const d = new Date('2026-09-19T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return {
      hash: Math.floor(rnd() * 0xfffffff).toString(16).padStart(7, '0').slice(0, 7),
      date: d.toISOString().slice(0, 10),
      type: i < h.bugFixes ? 'Bug Fix' : i < h.reverts + h.bugFixes ? 'Revert' : pickType(rnd()),
      message: `${h.module.toLowerCase()}: ${['update', 'adjust', 'rework', 'patch', 'harden', 'clean up'][i % 6]} ${baseName.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}${i < h.bugFixes ? ' (bug fix)' : ''}`,
      added: Math.max(5, Math.round((h.linesAdded / h.revisions) * (0.5 + rnd()))),
      deleted: Math.max(2, Math.round((h.linesDeleted / h.revisions) * (0.5 + rnd()))),
      author: AUTHOR_POOL[Math.floor(rnd() * AUTHOR_POOL.length)],
    };
  });
  const sharedFindings = findings.filter(
    (f) => f.evidence.some((e) => e.includes(h.path)) || f.area === h.module,
  );
  return {
    path: h.path,
    module: h.module,
    language: h.language,
    loc: h.loc,
    functions: fnCount,
    classes: 1 + Math.floor(rnd() * 2),
    imports: 3 + Math.floor(rnd() * 5),
    complexity: h.complexity,
    revisions: h.revisions,
    linesAdded: h.linesAdded,
    linesDeleted: h.linesDeleted,
    bugFixes: h.bugFixes,
    reverts: h.reverts,
    risk: h.risk,
    riskSeverity: h.riskSeverity,
    churnLevel: h.churnLevel,
    testSignal: h.testSignal,
    debtCount: 1 + Math.floor(rnd() * 3),
    coupling: { afferent: 3 + Math.floor(rnd() * 30), efferent: 1 + Math.floor(rnd() * 12) },
    summary: `${baseName} belongs to the ${h.module} module. Derived signals: ${h.revisions} revisions, ${h.bugFixes} bug-fix commits, complexity ${h.complexity}, test signal ${h.testSignal}. Structural details below are representative mock values for this demonstration dataset.`,
    structure: {
      functions: fnEntries,
      classes: [
        { name: `${baseName.replace(/[^A-Za-z]/g, '')}Error`, loc: 12 + Math.floor(rnd() * 30), methods: 2 + Math.floor(rnd() * 4) },
      ],
      imports: ([
        { source: 'react', kind: 'import', symbols: ['useEffect', 'useState'] },
        { source: '../api/client', kind: 'import', symbols: ['request'] },
        { source: '../state/store', kind: 'import', symbols: ['useStore'] },
        { source: `./${baseName.toLowerCase()}Types`, kind: 'type', symbols: ['Options'] },
        { source: '../utils/date', kind: 'import', symbols: ['isExpired'] },
      ] as FileImport[]).slice(0, 3 + Math.floor(rnd() * 3)),
    },
    history,
    findings: sharedFindings,
    debt: [
      {
        line: 10 + Math.floor(rnd() * 400),
        type: rnd() > 0.5 ? 'TODO' : 'FIXME',
        severity: h.risk >= 80 ? 'high' : 'medium',
        ageDays: 20 + Math.floor(rnd() * 160),
        text: 'Debt marker identified by static scan (representative mock entry).',
      },
    ],
  };
}

const cache = new Map<string, FileDetails>();

export function fileDetailsByPath(path: string): FileDetails {
  if (path === 'src/auth/AuthProvider.tsx') return authProvider;
  const hit = cache.get(path);
  if (hit) return hit;
  const hotspot = hotspots.find((h) => h.path === path);
  if (!hotspot) throw new Error(`File not found in analysis dataset: ${path}`);
  const details = deriveFileDetails(hotspot);
  cache.set(path, details);
  return details;
}

export const fileDetailsPaths = hotspots.map((h) => h.path);
