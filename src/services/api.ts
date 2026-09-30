/* ------------------------------------------------------------------ */
/* API service layer.                                                  */
/*                                                                     */
/* Every function returns a Promise and currently resolves from the    */
/* mock dataset in src/mock. To connect a real backend (e.g. FastAPI), */
/* replace the function bodies with fetch/axios calls — the shapes     */
/* consumed by the UI are defined in src/types and do not change.      */
/*                                                                     */
/* Analysis flow: analyzeRepository() creates a job and returns an     */
/* analysisId → getAnalysisStatus() tracks it → the completed job      */
/* resolves a repositoryId used for all /repository/:repositoryId/*    */
/* queries below.                                                      */
/* ------------------------------------------------------------------ */

import { knownRepositories } from '../mock/repository';
import { health, primaryFinding } from '../mock/health';
import { friction } from '../mock/friction';
import { hotspots } from '../mock/hotspots';
import { git } from '../mock/git';
import { codeHealth } from '../mock/codeHealth';
import { architecture } from '../mock/architecture';
import { debt } from '../mock/debt';
import { testing } from '../mock/testing';
import { documentation } from '../mock/documentation';
import { issuesData } from '../mock/issues';
import { prsData } from '../mock/issues';
import { evolution } from '../mock/evolution';
import { findings, recommendations } from '../mock/findings';
import { fileDetailsByPath } from '../mock/fileDetails';
import { AnalysisNotFoundError, createJob, getJob } from '../mock/analysisJobs';
import type {
  AnalysisJob,
  ArchitectureData,
  CodeHealthData,
  DebtData,
  DocumentationData,
  EvolutionData,
  FileDetails,
  Finding,
  FrictionData,
  GitForensicsData,
  HealthData,
  Hotspot,
  IssuesData,
  PrimaryFinding,
  PullRequestsData,
  Recommendation,
  Repository,
  TestingData,
} from '../types';

const delay = (ms = 300): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function error(code: string, message: string): Error {
  return Object.assign(new Error(message), { code });
}

export interface AnalyzeResult {
  analysisId: string;
}

export const GITHUB_URL_RE = /^(?:https?:\/\/)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;

export { AnalysisNotFoundError };

export const api = {
  /** Kick off an analysis. Returns the analysis job id to track via getAnalysisStatus(). */
  async analyzeRepository(url: string): Promise<AnalyzeResult> {
    await delay(500);
    if (!GITHUB_URL_RE.test(url.trim())) {
      throw error('INVALID_URL', 'Repository URL is invalid.');
    }
    if (/private/i.test(url)) {
      throw error('AUTH_REQUIRED', 'This repository requires authentication.');
    }
    return { analysisId: createJob(url.trim()) };
  },

  /** Poll an analysis job. The completed job resolves the repository id. */
  async getAnalysisStatus(analysisId: string): Promise<AnalysisJob> {
    await delay(120);
    return getJob(analysisId);
  },

  async getRepository(id: string): Promise<Repository> {
    await delay();
    const repo = knownRepositories[id];
    if (!repo) throw error('NOT_FOUND', 'The repository could not be accessed.');
    return repo;
  },

  async getHealthMetrics(_id: string): Promise<HealthData> {
    await delay();
    return health;
  },

  async getPrimaryFinding(_id: string): Promise<PrimaryFinding> {
    await delay();
    return primaryFinding;
  },

  async getDevelopmentFriction(_id: string): Promise<FrictionData> {
    await delay();
    return friction;
  },

  async getHotspots(_id: string): Promise<Hotspot[]> {
    await delay();
    return hotspots;
  },

  async getFileDetails(_id: string, path: string): Promise<FileDetails> {
    await delay(400);
    return fileDetailsByPath(path);
  },

  async getGitForensics(_id: string): Promise<GitForensicsData> {
    await delay();
    return git;
  },

  async getCodeHealth(_id: string): Promise<CodeHealthData> {
    await delay();
    return codeHealth;
  },

  async getArchitecture(_id: string): Promise<ArchitectureData> {
    await delay();
    return architecture;
  },

  async getTechnicalDebt(_id: string): Promise<DebtData> {
    await delay();
    return debt;
  },

  async getTestingHealth(_id: string): Promise<TestingData> {
    await delay();
    return testing;
  },

  async getDocumentationHealth(_id: string): Promise<DocumentationData> {
    await delay();
    return documentation;
  },

  async getIssues(_id: string): Promise<IssuesData> {
    await delay();
    return issuesData;
  },

  async getPullRequests(_id: string): Promise<PullRequestsData> {
    await delay();
    return prsData;
  },

  async getEvolution(_id: string): Promise<EvolutionData> {
    await delay();
    return evolution;
  },

  async getFindings(_id: string): Promise<Finding[]> {
    await delay();
    return findings;
  },

  async getRecommendations(_id: string): Promise<Recommendation[]> {
    await delay();
    return recommendations;
  },
};
