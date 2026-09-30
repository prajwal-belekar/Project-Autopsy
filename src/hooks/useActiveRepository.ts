import { useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useRepository } from './useQueries';
import type { Repository } from '../types';

interface RepositoryOutletContext {
  repository?: Repository;
}

/**
 * Single source of truth for the active repository.
 *
 * The AppShell fetches the repository once for the current route param and
 * publishes it via router outlet context; this hook prefers that value and
 * falls back to the shared TanStack Query cache. Pages never invent
 * repository information or build repository routes from constants.
 * Returns undefined repository when used outside the repository workspace.
 */
export function useActiveRepository(): { repositoryId: string; repository?: Repository } {
  const { repoId = '' } = useParams();
  const context = useOutletContext<RepositoryOutletContext>();
  const query = useRepository(repoId);
  return { repositoryId: repoId, repository: context?.repository ?? query.data };
}
