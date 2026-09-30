from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from enum import Enum


class AnalysisStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisStepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisStep(BaseModel):
    key: str
    name: str
    status: AnalysisStepStatus


class AnalysisJobCreate(BaseModel):
    repository_url: HttpUrl


class AnalysisJobResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus


class AnalysisJobStatus(BaseModel):
    id: str
    url: str
    status: AnalysisStatus
    created_at: str
    repository_id: Optional[str] = None
    error: Optional[str] = None
    steps: List[AnalysisStep] = []


class RepositoryMetadata(BaseModel):
    name: str
    url: str
    branch: str
    language: str
    languages: List[Dict[str, Any]]
    files: int
    lines_of_code: int
    commits: int
    contributors: int
    active_days: int
    age_months: int
    last_analyzed_at: str
    analysis_status: str


class GitAnalysis(BaseModel):
    commits: int
    active_days: int
    avg_changes_per_commit: float
    reverts: int
    bug_fix_commits: int
    refactor_commits: int
    activity: List[Dict[str, Any]]
    classification: List[Dict[str, Any]]
    classification_note: str
    churn: List[Dict[str, Any]]
    high_churn_files: List[Dict[str, Any]]
    rework: Dict[str, Any]
    stalls: List[Dict[str, Any]]
    patterns: List[Dict[str, Any]]
    recent_commits: List[Dict[str, Any]]


class CodeAnalysis(BaseModel):
    metrics: List[Dict[str, Any]]
    complexity_distribution: List[Dict[str, Any]]
    largest_files: List[Dict[str, Any]]
    largest_functions: List[Dict[str, Any]]
    coupling: List[Dict[str, Any]]


class ArchitectureAnalysis(BaseModel):
    source_modules: int
    dependency_edges: int
    graph_modules: List[Dict[str, Any]]
    circular: List[Dict[str, Any]]
    highly_coupled: List[Dict[str, Any]]
    summary: str
    inference_note: str


class TestingAnalysis(BaseModel):
    test_files: int
    source_files: int
    ratio_pct: float
    suites: List[Dict[str, Any]]
    activity: List[Dict[str, Any]]
    risk_areas: List[Dict[str, Any]]
    note: str


class DocumentationAnalysis(BaseModel):
    items: List[Dict[str, Any]]
    inline_stats: List[Dict[str, str]]
    note: str


class EvolutionAnalysis(BaseModel):
    events: List[Dict[str, Any]]
    note: str


class HotspotAnalysis(BaseModel):
    id: str
    path: str
    module: str
    language: str
    ext: str
    loc: int
    complexity: int
    revisions: int
    lines_added: int
    lines_deleted: int
    bug_fixes: int
    reverts: int
    churn_level: str
    test_signal: str
    last_touched: str
    risk: int
    risk_severity: str


class AnalyzeResult(BaseModel):
    analysis_id: str


class HealthMetric(BaseModel):
    label: str
    score: int
    status: str
    severity: str
    hint: str


class HealthData(BaseModel):
    overall: int
    status: str
    statusSeverity: str
    metrics: List[HealthMetric]
    methodology: str


class PrimaryFinding(BaseModel):
    area: str
    filePath: str
    summary: str
    severity: str
    evidence: List[Dict[str, Any]]


class FrictionFactor(BaseModel):
    name: str
    level: str
    tone: str
    score: int
    weightPct: int
    description: str
    source: str


class FrictionPoint(BaseModel):
    date: str
    score: int


class FrictionData(BaseModel):
    score: int
    level: str
    description: str
    series: List[FrictionPoint]
    factors: List[FrictionFactor]
    weights: List[Dict[str, Any]]
    note: str
    # Phase 3 transparency: exact per-factor contribution to the score,
    # plus category-level contributions (structural / historical / quality).
    contributions: Optional[Dict[str, float]] = None
    category_contributions: Optional[Dict[str, float]] = None


class Hotspot(BaseModel):
    id: str
    path: str
    module: str
    language: str
    ext: str
    loc: int
    complexity: int
    revisions: int
    linesAdded: int
    linesDeleted: int
    bugFixes: int
    reverts: int
    churnLevel: str
    testSignal: str
    lastTouched: str
    risk: int
    riskSeverity: str
    # Phase 3 transparency: per-signal breakdown of the score.
    signals: Optional[Dict[str, float]] = None
    weights: Optional[Dict[str, float]] = None


class FunctionInfo(BaseModel):
    name: str
    loc: int
    complexity: int
    nesting: int
    params: int


class ClassInfo(BaseModel):
    name: str
    loc: int
    methods: int


class FileImport(BaseModel):
    source: str
    kind: str
    symbols: List[str]


class FileCommit(BaseModel):
    hash: str
    date: str
    type: str
    message: str
    added: int
    deleted: int
    author: str


class FileDebtMarker(BaseModel):
    line: int
    type: str
    severity: str
    ageDays: int
    text: str


class FileDetails(BaseModel):
    path: str
    module: str
    language: str
    loc: int
    functions: int
    classes: int
    imports: int
    complexity: int
    revisions: int
    linesAdded: int
    linesDeleted: int
    bugFixes: int
    reverts: int
    risk: int
    riskSeverity: str
    churnLevel: str
    testSignal: str
    debtCount: int
    coupling: Dict[str, int]
    summary: str
    structure: Dict[str, Any]
    history: List[FileCommit]
    findings: List[Any]
    debt: List[FileDebtMarker]


class Finding(BaseModel):
    id: str
    title: str
    area: str
    severity: str
    observation: str
    evidence: List[str]
    impact: str
    recommendation: str
    evidenceLink: Dict[str, str]
    aiInterpretation: Optional[Dict[str, str]] = None


class Recommendation(BaseModel):
    id: str
    priority: str
    priorityLabel: str
    issue: str
    evidence: List[str]
    action: str
    benefit: str
    findingId: Optional[str] = None


class MonthlyActivity(BaseModel):
    month: str
    commits: int
    additions: int
    deletions: int


class CommitTypeCount(BaseModel):
    type: str
    count: int
    pct: int
    color: str


class ChurnFile(BaseModel):
    path: str
    added: int
    deleted: int
    net: int
    revisions: int


class ReworkSignals(BaseModel):
    repeatedlyModifiedFiles: int
    reverts: int
    repeatedBugFixes: int
    highChurnHotspots: int
    # Phase 3 transparency: overall rework metric.
    rework_score: Optional[int] = None
    rework_level: Optional[str] = None
    description: Optional[str] = None
    signals: Optional[Dict[str, Any]] = None


class StallPeriod(BaseModel):
    id: str
    period: str
    inactiveDays: int
    subsequentChange: str
    affectedArea: str
    note: str


class ActivityPattern(BaseModel):
    id: str
    name: str
    commits: int
    description: str
    method: str


class RecentCommit(BaseModel):
    hash: str
    message: str
    date: str
    type: str


class GitForensicsData(BaseModel):
    totals: Dict[str, Any]
    activity: List[MonthlyActivity]
    classification: List[CommitTypeCount]
    classificationNote: str
    churn: List[MonthlyActivity]
    highChurnFiles: List[ChurnFile]
    rework: ReworkSignals
    stalls: List[StallPeriod]
    patterns: List[ActivityPattern]
    recentCommits: List[RecentCommit]


class CodeHealthData(BaseModel):
    metrics: List[HealthMetric]
    complexityDistribution: List[Dict[str, Any]]
    largestFiles: List[Dict[str, Any]]
    largestFunctions: List[Dict[str, Any]]
    coupling: List[Dict[str, Any]]


class ArchModule(BaseModel):
    id: str
    name: str
    layer: str
    files: int
    loc: int
    dependsOn: List[str]


class CircularDependency(BaseModel):
    id: str
    cycle: List[str]
    severity: str
    introduced: str
    note: str


class CoupledModule(BaseModel):
    id: str
    name: str
    fanIn: int
    fanOut: int
    risk: str


class ArchitectureData(BaseModel):
    sourceModules: int
    dependencyEdges: int
    graphModules: List[ArchModule]
    circular: List[CircularDependency]
    highlyCoupled: List[CoupledModule]
    summary: str
    inferenceNote: str


class DebtMarker(BaseModel):
    id: str
    location: str
    line: int
    type: str
    severity: str
    ageDays: int
    description: str


class DebtData(BaseModel):
    counts: Dict[str, int]
    register: List[DebtMarker]
    note: str


class SuiteStatus(BaseModel):
    name: str
    status: str
    evidence: str


class TestingData(BaseModel):
    testFiles: int
    sourceFiles: int
    ratioPct: int
    suites: List[SuiteStatus]
    activity: List[Dict[str, Any]]
    riskAreas: List[Dict[str, Any]]
    note: str


class DocItem(BaseModel):
    name: str
    status: str
    evidence: str


class DocumentationData(BaseModel):
    items: List[DocItem]
    inlineStats: List[Dict[str, str]]
    note: str


class IssueRecord(BaseModel):
    id: str
    number: int
    title: str
    state: str
    label: str
    ageDays: int
    comments: int
    linkedCommits: int


class PRRecord(BaseModel):
    id: str
    number: int
    title: str
    state: str
    additions: int
    deletions: int
    openDays: int
    files: int


class IssuesData(BaseModel):
    open: int
    closed: int
    reopened: int
    stale: int
    bugs: int
    enhancements: int
    trend: List[Dict[str, Any]]
    top: List[IssueRecord]


class PullRequestsData(BaseModel):
    open: int
    merged: int
    closed: int
    longRunning: int
    reopened: int
    trend: List[Dict[str, Any]]
    top: List[PRRecord]


class EvolutionEvent(BaseModel):
    id: str
    month: str
    date: str
    title: str
    description: str
    commits: int
    filesChanged: int
    modules: List[str]
    issues: int
    prs: int
    complexityChange: int
    frictionChange: int
    evidenceLink: Dict[str, str]


class EvolutionData(BaseModel):
    events: List[EvolutionEvent]
    note: str
    # Phase 3 time-aware transparency: period comparison deltas.
    time_analysis: Optional[Dict[str, Any]] = None


class Repository(BaseModel):
    id: str
    name: str
    url: str
    branch: str
    language: str
    languages: List[Dict[str, Any]]
    files: int
    linesOfCode: int
    commits: int
    contributors: int
    activeDays: int
    ageMonths: int
    lastAnalyzedAt: str
    analysisStatus: str