/* ------------------------------------------------------------------ */
/* API service layer.                                                  */
/*                                                                     */
/* Every function returns a Promise and now resolves from the          */
/* FastAPI backend at http://localhost:8000/api. The TypeScript      */
/* contracts in src/types do not change.                               */
/*                                                                 */
/* Analysis flow: analyzeRepository() creates a job and returns an     */
/* analysisId → getAnalysisStatus() tracks it → the completed job      */
/* resolves a repositoryId used for all /repository/:repositoryId/*    */
/* queries below.                                                      */
/* ------------------------------------------------------------------ */

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

export const GITHUB_URL_RE = /^(?:https?:\/\/)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+(?<!\.git)\/?$/i;

export const BASE_URL = "http://localhost:8000/api";

const delay = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function error(code: string, message: string): Error {
  return Object.assign(new Error(message), { code });
}

export interface AnalyzeResult {
  analysisId: string;
}

/** Kick off an analysis. Returns the analysis job id to track via getAnalysisStatus(). */
export const api = {
  async analyzeRepository(url: string): Promise<AnalyzeResult> {
    await delay(500);
    if (!GITHUB_URL_RE.test(url.trim())) {
      throw error("INVALID_URL", "Repository URL is invalid.");
    }
    if (/private/i.test(url)) {
      throw error("AUTH_REQUIRED", "This repository requires authentication.");
    }
    const response = await fetch(`${BASE_URL}/analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repository_url: url }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw error(
        String(response.status),
        data.detail || "Failed to create analysis job."
      );
    }
    return { analysisId: data.analysis_id };
  },

  /** Poll an analysis job. The completed job resolves the repository id. */
  async getAnalysisStatus(analysisId: string): Promise<AnalysisJob> {
    await delay(120);
    const response = await fetch(`${BASE_URL}/analysis/${analysisId}`);
    const data = await response.json();
    if (!response.ok) {
      throw error("ANALYSIS_NOT_FOUND", data.detail || "Analysis job not found.");
    }
    return data;
  },

  async getRepository(id: string): Promise<Repository> {
    const response = await fetch(`${BASE_URL}/repositories/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getHealthMetrics(_id: string): Promise<HealthData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/health`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getPrimaryFinding(_id: string): Promise<PrimaryFinding> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/primary-finding`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getDevelopmentFriction(_id: string): Promise<FrictionData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/friction`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getHotspots(_id: string): Promise<Hotspot[]> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/hotspots`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getFileDetails(_id: string, path: string): Promise<FileDetails> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/files/${path}`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "File not found.");
    }
    return data;
  },

  async getGitForensics(_id: string): Promise<GitForensicsData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/git`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getCodeHealth(_id: string): Promise<CodeHealthData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/health`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getArchitecture(_id: string): Promise<ArchitectureData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/architecture`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getTechnicalDebt(_id: string): Promise<DebtData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/debt`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getTestingHealth(_id: string): Promise<TestingData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/testing`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getDocumentationHealth(_id: string): Promise<DocumentationData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/documentation`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getIssues(_id: string): Promise<IssuesData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/issues`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getPullRequests(_id: string): Promise<PullRequestsData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/pulls`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getEvolution(_id: string): Promise<EvolutionData> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/evolution`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getFindings(_id: string): Promise<Finding[]> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/findings`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },

  async getRecommendations(_id: string): Promise<Recommendation[]> {
    const response = await fetch(`${BASE_URL}/repositories/${_id}/recommendations`);
    const data = await response.json();
    if (!response.ok) {
      throw error("NOT_FOUND", data.detail || "Repository not found.");
    }
    return data;
  },
};