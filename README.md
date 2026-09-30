# Project Autopsy — Frontend

An evidence-driven engineering investigation console. Project Autopsy reconstructs repository
history, identifies areas of development friction and structural risk, and connects every finding
to observable engineering evidence.

**Stack:** React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS v4 + Recharts + React Router 7 +
TanStack Query 5 + Zustand + Framer Motion + Lucide.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck  # tsc --noEmit (strict)
npm run build      # typecheck + production bundle
npm run preview    # serve the production build
```

## Routes

```text
/                                Landing
/analyze                         Submit a repository URL
/analysis/:analysisId            Analysis job tracking (per-step status)
/repository/:repositoryId        Repository workspace (Overview)
/repository/:repositoryId/code-health
/repository/:repositoryId/git
/repository/:repositoryId/friction
/repository/:repositoryId/hotspots
/repository/:repositoryId/architecture
/repository/:repositoryId/debt
/repository/:repositoryId/testing
/repository/:repositoryId/documentation
/repository/:repositoryId/issues
/repository/:repositoryId/evolution
/repository/:repositoryId/findings
/repository/:repositoryId/file/:filePath   File investigation (splat — handles "src/auth/X.tsx")
```

Every repository route is dynamic: the repository id always comes from the route parameter (see
`useActiveRepository()`), never from a constant. The only literals referencing the bundled demo
dataset live in `src/mock/*` (data) and the landing page's sample entry, which derives its target
from `sampleRepositoryRoute` in `src/mock/repository.ts`.

## Analysis flow

```text
Landing → /analyze → submit GitHub URL
        → api.analyzeRepository() creates an analysis job → { analysisId }
        → /analysis/:analysisId tracks the job (Pending / Running / Completed / Failed)
        → completed job resolves the repositoryId
        → opens /repository/:repositoryId
```

The tracking page polls `getAnalysisStatus()` only while the job is in flight and never renders
synthetic percentage progress — step states come from the job record.

## Architecture

```
src/
├── components/
│   ├── charts/        # Recharts wrappers + custom SVG dependency graph
│   ├── common/        # Panel, DataTable (sortable/paginated), badges, tabs, filters, skeletons…
│   ├── evidence/      # EvidenceList, methodology weights, signal disclaimers
│   ├── findings/      # FindingCard, RecommendationCard
│   ├── layout/        # AppShell, Sidebar, Header, ExportMenu, BareHeader
│   └── navigation/    # ⌘K command search (repository-scoped)
├── hooks/             # TanStack Query hooks, useActiveRepository, useDebounce
├── mock/              # Realistic mock dataset + in-memory analysis job store (one file per domain)
├── pages/             # One folder per route
├── routes/            # Lazy-loaded route table
├── services/          # api.ts — the ONLY place mock data is resolved
├── stores/            # Zustand UI store (drawer, search)
├── types/             # All backend data contracts
└── utils/             # formatting, severity mapping, series math, download
```

### Conventions

- **Single repository source of truth.** `AppShell` fetches the repository for the active route and
  publishes it via outlet context; `useActiveRepository()` exposes it to pages. Repository-specific
  navigation is always built from `useParams()`.
- **Repository-relative evidence links.** Mock/domain data stores evidence targets relative to the
  repository root (e.g. `to: 'git'`, `to: 'file/src/auth/AuthProvider.tsx'`); components prefix them
  with `/repository/${repositoryId}/`. No domain data contains a concrete repository id in a route.
- **Components never import `src/mock` directly** (the landing page's sample preview is the only
  exception, since it previews the bundled dataset by design). All workspace data flows through
  `src/services/api.ts` via TanStack Query.

### Connecting a real backend (FastAPI)

All data flows through `src/services/api.ts`: `analyzeRepository`, `getAnalysisStatus`,
`getRepository`, `getHealthMetrics`, `getDevelopmentFriction`, `getHotspots`, `getFileDetails`,
`getGitForensics`, `getCodeHealth`, `getArchitecture`, `getTechnicalDebt`, `getTestingHealth`,
`getDocumentationHealth`, `getIssues`, `getPullRequests`, `getEvolution`, `getFindings`,
`getRecommendations`. Each currently resolves from `src/mock` (the analysis job store simulates a
worker by deriving step completion from the job's creation timestamp). Replace the bodies with
`fetch` calls to FastAPI endpoints — the TypeScript contracts in `src/types` are the stable
interface and require no UI changes.

## Product rules honored by the codebase

- Deterministic signals only; AI appears exclusively as a labeled interpretation layer inside
  findings and never invents metrics.
- Evidence-based terminology throughout (development friction, rework signal, risk signal) — no
  developer blame, ranking, or personality scoring.
- Missing data renders an explicit empty state, never invented numbers.
- Restrained dark engineering aesthetic; semantic colors only where information requires them.
- Accessible: semantic tables, keyboard-navigable controls, visible focus, ARIA labels, risk never
  communicated by color alone, `prefers-reduced-motion` support.

> Note: this build ships a demonstration dataset. Metrics, commits, files, and findings describe the
> sample repository `company/project-atlas`, not a real project.
