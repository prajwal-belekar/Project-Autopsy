import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../services/api';

export const useAnalysisStatus = (analysisId: string) =>
  useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => api.getAnalysisStatus(analysisId),
    // Poll only while the job is in flight; stop once it settles.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'running' || status === 'queued' ? 650 : false;
    },
    retry: false,
  });

export const useRepository = (id: string) =>
  useQuery({ queryKey: ['repository', id], queryFn: () => api.getRepository(id) });

export const useHealthMetrics = (id: string) =>
  useQuery({ queryKey: ['health', id], queryFn: () => api.getHealthMetrics(id) });

export const usePrimaryFinding = (id: string) =>
  useQuery({ queryKey: ['primary-finding', id], queryFn: () => api.getPrimaryFinding(id) });

export const useFriction = (id: string) =>
  useQuery({ queryKey: ['friction', id], queryFn: () => api.getDevelopmentFriction(id) });

export const useHotspots = (id: string) =>
  useQuery({ queryKey: ['hotspots', id], queryFn: () => api.getHotspots(id) });

export const useFileDetails = (id: string, path: string) =>
  useQuery({
    queryKey: ['file-details', id, path],
    queryFn: () => api.getFileDetails(id, path),
    enabled: path.length > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });

export const useGitForensics = (id: string) =>
  useQuery({ queryKey: ['git', id], queryFn: () => api.getGitForensics(id) });

export const useCodeHealth = (id: string) =>
  useQuery({ queryKey: ['code-health', id], queryFn: () => api.getCodeHealth(id) });

export const useArchitecture = (id: string) =>
  useQuery({ queryKey: ['architecture', id], queryFn: () => api.getArchitecture(id) });

export const useTechnicalDebt = (id: string) =>
  useQuery({ queryKey: ['debt', id], queryFn: () => api.getTechnicalDebt(id) });

export const useTestingHealth = (id: string) =>
  useQuery({ queryKey: ['testing', id], queryFn: () => api.getTestingHealth(id) });

export const useDocumentationHealth = (id: string) =>
  useQuery({ queryKey: ['documentation', id], queryFn: () => api.getDocumentationHealth(id) });

export const useIssues = (id: string) =>
  useQuery({ queryKey: ['issues', id], queryFn: () => api.getIssues(id) });

export const usePullRequests = (id: string) =>
  useQuery({ queryKey: ['pull-requests', id], queryFn: () => api.getPullRequests(id) });

export const useEvolution = (id: string) =>
  useQuery({ queryKey: ['evolution', id], queryFn: () => api.getEvolution(id) });

export const useFindings = (id: string) =>
  useQuery({ queryKey: ['findings', id], queryFn: () => api.getFindings(id) });

export const useRecommendations = (id: string) =>
  useQuery({ queryKey: ['recommendations', id], queryFn: () => api.getRecommendations(id) });
