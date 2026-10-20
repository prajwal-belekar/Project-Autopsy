import type { AnalysisJob, AnalysisStep } from '../types';

/* ------------------------------------------------------------------ */
/* Mock analysis job store.                                            */
/*                                                                     */
/* Simulates a backend analysis worker: jobs are created by            */
/* analyzeRepository() and progress deterministically from their       */
/* creation timestamp. Step completion is time-derived — no fake       */
/* percentage progress. In production this state lives in FastAPI.     */
/* ------------------------------------------------------------------ */

export const STEP_NAMES = [
  'Repository',
  'Repository Metadata',
  'Git History',
  'Source Analysis',
  'Complexity Analysis',
  'Hotspot Detection',
  'Architecture Analysis',
  'Technical Debt',
  'Testing',
  'Findings',
] as const;

const STEP_MS = 560;
/** Grace period after the last step before the job flips to completed. */
const COMPLETE_MS = 400;

interface JobRecord {
  url: string;
  createdAt: number;
}

const jobs = new Map<string, JobRecord>();

export function createJob(url: string): string {
  const id = `an-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
  jobs.set(id, { url, createdAt: Date.now() });
  return id;
}

function stepStatus(elapsed: number, index: number): AnalysisStep['status'] {
  if (elapsed >= (index + 1) * STEP_MS) return 'completed';
  if (elapsed >= index * STEP_MS) return 'running';
  return 'pending';
}

export class AnalysisNotFoundError extends Error {
  constructor(id: string) {
    super(`The analysis job "${id}" could not be found.`);
    this.name = 'AnalysisNotFoundError';
  }
}

export function getJob(id: string): AnalysisJob {
  const record = jobs.get(id);
  if (!record) throw new AnalysisNotFoundError(id);

  const elapsed = Date.now() - record.createdAt;
  const totalMs = STEP_NAMES.length * STEP_MS + COMPLETE_MS;
  const done = elapsed >= totalMs;

  const steps: AnalysisStep[] = STEP_NAMES.map((name, i) => ({
    key: name.toLowerCase().replace(/[^a-z]+/g, '-'),
    name,
    status: done ? 'completed' : stepStatus(elapsed, i),
  }));

  return {
    id,
    url: record.url,
    status: done ? 'completed' : elapsed <= 0 ? 'queued' : 'running',
    createdAt: new Date(record.createdAt).toISOString(),
    repositoryId: done ? 'project-atlas' : null,
    error: null,
    steps,
  };
}
