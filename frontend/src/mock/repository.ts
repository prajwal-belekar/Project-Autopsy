import type { Repository } from '../types';

/** Sample dataset: company/project-atlas (mock analysis result). */
export const repository: Repository = {
  id: 'project-atlas',
  name: 'Project Atlas',
  url: 'github.com/company/project-atlas',
  branch: 'main',
  language: 'TypeScript',
  languages: [
    { name: 'TypeScript', pct: 87.4 },
    { name: 'CSS', pct: 6.1 },
    { name: 'SQL', pct: 3.2 },
    { name: 'Other', pct: 3.3 },
  ],
  files: 184,
  linesOfCode: 72431,
  commits: 1284,
  contributors: 8,
  activeDays: 126,
  ageMonths: 11,
  lastAnalyzedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  analysisStatus: 'complete',
};

/** Repositories known to the (mock) service. */
export const knownRepositories: Record<string, Repository> = {
  [repository.id]: repository,
};

/**
 * Route of the bundled sample analysis, used only by the landing page as the
 * demo entry point. Derived from the mock dataset id — never hardcoded in UI.
 */
export const sampleRepositoryRoute = `/repository/${repository.id}`;
