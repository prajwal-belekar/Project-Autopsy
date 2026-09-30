/* ------------------------------------------------------------------ */
/* Domain types — the frontend expects this structured data from the   */
/* backend API. Mock data in src/mock conforms to these interfaces.    */
/* ------------------------------------------------------------------ */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type SignalLevel =
  | 'high'
  | 'moderate'
  | 'medium'
  | 'low'
  | 'available'
  | 'partial'
  | 'none';

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  language: string;
  languages: { name: string; pct: number }[];
  files: number;
  linesOfCode: number;
  commits: number;
  contributors: number;
  activeDays: number;
  ageMonths: number;
  lastAnalyzedAt: string;
  analysisStatus: 'complete' | 'partial' | 'failed';
}

/* ----------------------------- Health ----------------------------- */

export interface HealthMetric {
  label: string;
  score: number;
  status: string;
  severity: Severity;
  hint: string;
}

export interface HealthData {
  overall: number;
  status: string;
  statusSeverity: Severity;
  metrics: HealthMetric[];
  methodology: string;
}

export interface PrimaryFinding {
  area: string;
  filePath: string;
  summary: string;
  severity: Severity;
  evidence: { label: string; value: string; tone?: 'neutral' | Severity }[];
}

/* ---------------------------- Friction ---------------------------- */

export interface FrictionFactor {
  name: string;
  level: SignalLevel;
  tone: 'ok' | 'warn' | 'high' | 'crit';
  score: number;
  weightPct: number;
  description: string;
  source: string;
}

export interface FrictionPoint {
  date: string;
  score: number;
}

export interface FrictionData {
  score: number;
  level: SignalLevel;
  description: string;
  series: FrictionPoint[];
  factors: FrictionFactor[];
  weights: { factor: string; pct: number }[];
  note: string;
}

/* ---------------------------- Hotspots ---------------------------- */

export interface Hotspot {
  id: string;
  path: string;
  module: string;
  language: string;
  ext: string;
  loc: number;
  complexity: number;
  revisions: number;
  linesAdded: number;
  linesDeleted: number;
  bugFixes: number;
  reverts: number;
  churnLevel: SignalLevel;
  testSignal: SignalLevel;
  lastTouched: string;
  risk: number;
  riskSeverity: Severity;
}

/* ------------------------- File details --------------------------- */

export interface FunctionInfo {
  name: string;
  loc: number;
  complexity: number;
  nesting: number;
  params: number;
}

export interface ClassInfo {
  name: string;
  loc: number;
  methods: number;
}

export interface FileImport {
  source: string;
  kind: 'import' | 'type' | 'dynamic';
  symbols: string[];
}

export interface FileCommit {
  hash: string;
  date: string;
  type: string;
  message: string;
  added: number;
  deleted: number;
  author: string;
}

export interface FileDebtMarker {
  line: number;
  type: string;
  severity: Severity;
  ageDays: number;
  text: string;
}

export interface FileDetails {
  path: string;
  module: string;
  language: string;
  loc: number;
  functions: number;
  classes: number;
  imports: number;
  complexity: number;
  revisions: number;
  linesAdded: number;
  linesDeleted: number;
  bugFixes: number;
  reverts: number;
  risk: number;
  riskSeverity: Severity;
  churnLevel: SignalLevel;
  testSignal: SignalLevel;
  debtCount: number;
  coupling: { afferent: number; efferent: number };
  summary: string;
  structure: { functions: FunctionInfo[]; classes: ClassInfo[]; imports: FileImport[] };
  history: FileCommit[];
  findings: Finding[];
  debt: FileDebtMarker[];
}

/* ---------------------------- Findings ---------------------------- */

export interface Finding {
  id: string;
  title: string;
  area: string;
  severity: Severity;
  observation: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  evidenceLink: { label: string; to: string };
  aiInterpretation?: { text: string; disclaimer: string };
}

export interface Recommendation {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  priorityLabel: string;
  issue: string;
  evidence: string[];
  action: string;
  benefit: string;
  findingId?: string;
}

/* ------------------------- Git forensics -------------------------- */

export interface MonthlyActivity {
  month: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface CommitTypeCount {
  type: string;
  count: number;
  pct: number;
  color: string;
}

export interface ChurnFile {
  path: string;
  added: number;
  deleted: number;
  net: number;
  revisions: number;
}

export interface ReworkSignals {
  repeatedlyModifiedFiles: number;
  reverts: number;
  repeatedBugFixes: number;
  highChurnHotspots: number;
}

export interface StallPeriod {
  id: string;
  period: string;
  inactiveDays: number;
  subsequentChange: string;
  affectedArea: string;
  note: string;
}

export interface ActivityPattern {
  id: string;
  name: string;
  commits: number;
  description: string;
  method: string;
}

export interface RecentCommit {
  hash: string;
  message: string;
  date: string;
  type: string;
}

export interface GitForensicsData {
  totals: {
    commits: number;
    activeDays: number;
    avgChangesPerCommit: number;
    reverts: number;
    bugFixCommits: number;
    refactorCommits: number;
  };
  activity: MonthlyActivity[];
  classification: CommitTypeCount[];
  classificationNote: string;
  churn: MonthlyActivity[];
  highChurnFiles: ChurnFile[];
  rework: ReworkSignals;
  stalls: StallPeriod[];
  patterns: ActivityPattern[];
  recentCommits: RecentCommit[];
}

/* -------------------------- Code health --------------------------- */

export interface CodeHealthData {
  metrics: { label: string; score: number; severity: Severity; hint: string }[];
  complexityDistribution: { band: string; files: number }[];
  largestFiles: { path: string; loc: number; complexity: number }[];
  largestFunctions: { name: string; path: string; loc: number; complexity: number }[];
  coupling: { module: string; fanIn: number; fanOut: number; score: number }[];
}

/* -------------------------- Architecture -------------------------- */

export interface ArchModule {
  id: string;
  name: string;
  layer: string;
  files: number;
  loc: number;
  dependsOn: string[];
}

export interface CircularDependency {
  id: string;
  cycle: string[];
  severity: Severity;
  introduced: string;
  note: string;
}

export interface CoupledModule {
  id: string;
  name: string;
  fanIn: number;
  fanOut: number;
  risk: Severity;
}

export interface ArchitectureData {
  sourceModules: number;
  dependencyEdges: number;
  graphModules: ArchModule[];
  circular: CircularDependency[];
  highlyCoupled: CoupledModule[];
  summary: string;
  inferenceNote: string;
}

/* ------------------------ Technical debt -------------------------- */

export interface DebtMarker {
  id: string;
  location: string;
  line: number;
  type: 'TODO' | 'FIXME' | 'HACK' | 'Large Function' | 'Duplication' | 'Deprecated Usage';
  severity: Severity;
  ageDays: number;
  description: string;
}

export interface DebtData {
  counts: {
    todo: number;
    fixme: number;
    hack: number;
    largeFunctions: number;
    duplication: number;
    deprecated: number;
  };
  register: DebtMarker[];
  note: string;
}

/* ---------------------------- Testing ----------------------------- */

export interface SuiteStatus {
  name: string;
  status: SignalLevel;
  evidence: string;
}

export interface TestingData {
  testFiles: number;
  sourceFiles: number;
  ratioPct: number;
  suites: SuiteStatus[];
  activity: { month: string; testCommits: number; testFiles: number }[];
  riskAreas: {
    path: string;
    module: string;
    risk: number;
    complexity: number;
    testSignal: SignalLevel;
    churn: SignalLevel;
  }[];
  note: string;
}

/* -------------------------- Documentation ------------------------- */

export interface DocItem {
  name: string;
  status: SignalLevel;
  evidence: string;
}

export interface DocumentationData {
  items: DocItem[];
  inlineStats: { label: string; value: string }[];
  note: string;
}

/* -------------------------- Issues & PRs -------------------------- */

export interface IssueRecord {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'reopened';
  label: string;
  ageDays: number;
  comments: number;
  linkedCommits: number;
}

export interface PRRecord {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'merged' | 'closed' | 'reopened';
  additions: number;
  deletions: number;
  openDays: number;
  files: number;
}

export interface IssuesData {
  open: number;
  closed: number;
  reopened: number;
  stale: number;
  bugs: number;
  enhancements: number;
  trend: { month: string; opened: number; closed: number; bugs: number }[];
  top: IssueRecord[];
}

export interface PullRequestsData {
  open: number;
  merged: number;
  closed: number;
  longRunning: number;
  reopened: number;
  trend: { month: string; opened: number; merged: number }[];
  top: PRRecord[];
}

/* --------------------------- Evolution ---------------------------- */

export interface EvolutionEvent {
  id: string;
  month: string;
  date: string;
  title: string;
  description: string;
  commits: number;
  filesChanged: number;
  modules: string[];
  issues: number;
  prs: number;
  complexityChange: number;
  frictionChange: number;
  evidenceLink: { label: string; to: string };
}

export interface EvolutionData {
  events: EvolutionEvent[];
  note: string;
}

/* --------------------------- Analysis job ------------------------- */

export type AnalysisStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AnalysisStep {
  key: string;
  name: string;
  status: AnalysisStepStatus;
}

export interface AnalysisJob {
  id: string;
  url: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  /** Set once the analysis completes and a repository workspace exists. */
  repositoryId: string | null;
  error: string | null;
  steps: AnalysisStep[];
}
