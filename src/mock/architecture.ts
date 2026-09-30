import type { ArchitectureData } from '../types';

export const architecture: ArchitectureData = {
  sourceModules: 42,
  dependencyEdges: 126,
  graphModules: [
    { id: 'ui/components', name: 'ui/components', layer: 'UI', files: 52, loc: 18400, dependsOn: ['ui/state', 'services/auth', 'services/payments', 'services/sync', 'shared/utils'] },
    { id: 'ui/state', name: 'ui/state', layer: 'UI', files: 14, loc: 5200, dependsOn: ['services/auth', 'api/client', 'shared/utils'] },
    { id: 'services/auth', name: 'services/auth', layer: 'Services', files: 9, loc: 4300, dependsOn: ['api/client', 'shared/utils'] },
    { id: 'services/payments', name: 'services/payments', layer: 'Services', files: 8, loc: 4900, dependsOn: ['api/client', 'shared/utils'] },
    { id: 'services/sync', name: 'services/sync', layer: 'Services', files: 7, loc: 3600, dependsOn: ['api/client', 'ui/state', 'shared/utils'] },
    { id: 'api/client', name: 'api/client', layer: 'API', files: 12, loc: 5400, dependsOn: ['db/cache', 'shared/utils'] },
    { id: 'api/routes', name: 'api/routes', layer: 'API', files: 16, loc: 7800, dependsOn: ['services/auth', 'services/payments', 'db/core', 'shared/utils'] },
    { id: 'db/core', name: 'db/core', layer: 'Data', files: 10, loc: 4600, dependsOn: ['shared/utils'] },
    { id: 'db/cache', name: 'db/cache', layer: 'Data', files: 6, loc: 2100, dependsOn: ['api/client', 'shared/utils'] },
    { id: 'shared/utils', name: 'shared/utils', layer: 'Shared', files: 22, loc: 3800, dependsOn: ['db/core'] },
    { id: 'workers/jobs', name: 'workers/jobs', layer: 'Workers', files: 6, loc: 2300, dependsOn: ['api/client', 'db/core'] },
  ],
  circular: [
    {
      id: 'cycle-1',
      cycle: ['api/client', 'db/cache'],
      severity: 'high',
      introduced: '2026-02-17',
      note: 'Cache invalidation callbacks imported back into the API client break layering.',
    },
    {
      id: 'cycle-2',
      cycle: ['shared/utils', 'db/core'],
      severity: 'medium',
      introduced: '2025-12-08',
      note: 'Shared utilities import a DB connection helper for one legacy function.',
    },
    {
      id: 'cycle-3',
      cycle: ['services/sync', 'ui/state'],
      severity: 'high',
      introduced: '2026-04-02',
      note: 'Sync service imports UI state store to push progress updates directly.',
    },
  ],
  highlyCoupled: [
    { id: 'api/client', name: 'api/client', fanIn: 34, fanOut: 12, risk: 'high' },
    { id: 'ui/state', name: 'ui/state', fanIn: 28, fanOut: 6, risk: 'medium' },
    { id: 'ui/components', name: 'ui/components', fanIn: 22, fanOut: 15, risk: 'medium' },
    { id: 'shared/utils', name: 'shared/utils', fanIn: 19, fanOut: 1, risk: 'low' },
    { id: 'services/auth', name: 'services/auth', fanIn: 14, fanOut: 8, risk: 'medium' },
    { id: 'services/sync', name: 'services/sync', fanIn: 6, fanOut: 9, risk: 'medium' },
    { id: 'db/core', name: 'db/core', fanIn: 11, fanOut: 2, risk: 'low' },
  ],
  summary:
    'Import-direction analysis groups 42 source-level modules into 11 top-level groups across 6 layers. The graph above aggregates 126 file-level dependency edges into 27 module-level edges.',
  inferenceNote:
    'Structure is consistent with a layered architecture (UI → Services → API → Data). 3 circular dependencies violate the inferred layering; they are drawn in orange in the graph above.',
};
