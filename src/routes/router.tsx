import { Suspense, lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { PageSkeleton } from '../components/common/Skeleton';

const Landing = lazy(() => import('../pages/Landing'));
const Analyze = lazy(() => import('../pages/Analyze'));
const Analysis = lazy(() => import('../pages/Analysis'));
const Overview = lazy(() => import('../pages/Overview'));
const CodeHealth = lazy(() => import('../pages/CodeHealth'));
const GitForensics = lazy(() => import('../pages/GitForensics'));
const Friction = lazy(() => import('../pages/Friction'));
const Hotspots = lazy(() => import('../pages/Hotspots'));
const FileInvestigation = lazy(() => import('../pages/FileInvestigation'));
const Architecture = lazy(() => import('../pages/Architecture'));
const TechnicalDebt = lazy(() => import('../pages/TechnicalDebt'));
const Testing = lazy(() => import('../pages/Testing'));
const Documentation = lazy(() => import('../pages/Documentation'));
const Issues = lazy(() => import('../pages/Issues'));
const Evolution = lazy(() => import('../pages/Evolution'));
const Findings = lazy(() => import('../pages/Findings'));

function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-edge bg-surface p-6 text-center">
        <h1 className="text-[15px] font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-xs leading-relaxed text-faint">
          The requested page does not exist in this application.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1440px] px-4 py-5">
            <PageSkeleton />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/analysis/:analysisId" element={<Analysis />} />
          <Route path="/repository/:repoId" element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="code-health" element={<CodeHealth />} />
            <Route path="git" element={<GitForensics />} />
            <Route path="friction" element={<Friction />} />
            <Route path="hotspots" element={<Hotspots />} />
            <Route path="architecture" element={<Architecture />} />
            <Route path="debt" element={<TechnicalDebt />} />
            <Route path="testing" element={<Testing />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="issues" element={<Issues />} />
            <Route path="evolution" element={<Evolution />} />
            <Route path="findings" element={<Findings />} />
            {/* Splat so file paths with segments ("src/auth/AuthProvider.tsx") resolve. */}
            <Route path="file/*" element={<FileInvestigation />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
