import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { downloadFile, toCsv } from '../../utils/download';

/**
 * Export actions for the active repository. Data is fetched through the
 * service layer (never imported from src/mock directly) so the export
 * automatically reflects the connected backend once wired up.
 */
export function ExportMenu() {
  const { repoId = '' } = useParams();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const exportPdf = () => {
    setOpen(false);
    window.print();
  };

  // Serve from the TanStack Query cache when present; otherwise fetch.
  const cached = <T,>(key: unknown[], fetcher: () => Promise<T>): Promise<T> => {
    const hit = queryClient.getQueryData<T>(key);
    return hit !== undefined ? Promise.resolve(hit) : fetcher();
  };

  const fetchAll = async () => {
    return Promise.all([
      cached(['repository', repoId], () => api.getRepository(repoId)),
      cached(['health', repoId], () => api.getHealthMetrics(repoId)),
      cached(['code-health', repoId], () => api.getCodeHealth(repoId)),
      cached(['git', repoId], () => api.getGitForensics(repoId)),
      cached(['friction', repoId], () => api.getDevelopmentFriction(repoId)),
      cached(['hotspots', repoId], () => api.getHotspots(repoId)),
      cached(['architecture', repoId], () => api.getArchitecture(repoId)),
      cached(['debt', repoId], () => api.getTechnicalDebt(repoId)),
      cached(['testing', repoId], () => api.getTestingHealth(repoId)),
      cached(['documentation', repoId], () => api.getDocumentationHealth(repoId)),
      cached(['issues', repoId], () => api.getIssues(repoId)),
      cached(['pull-requests', repoId], () => api.getPullRequests(repoId)),
      cached(['evolution', repoId], () => api.getEvolution(repoId)),
      cached(['findings', repoId], () => api.getFindings(repoId)),
      cached(['recommendations', repoId], () => api.getRecommendations(repoId)),
    ]);
  };

  const exportJson = async () => {
    setOpen(false);
    if (!repoId || busy) return;
    setBusy(true);
    try {
      const [
        repository, healthSummary, codeHealth, gitForensics, developmentFriction, hotspots,
        architecture, technicalDebt, testing, documentation, issues, pullRequests, evolution,
        findings, recommendations,
      ] = await fetchAll();
      const report = {
        product: 'Project Autopsy',
        repository: repository.url,
        generatedAt: new Date().toISOString(),
        sections: {
          repositoryOverview: repository,
          healthSummary,
          codeHealth,
          gitForensics,
          developmentFriction,
          hotspots,
          architecture,
          technicalDebt,
          testing,
          documentation,
          issues,
          pullRequests,
          evolution,
          findings,
          recommendations,
        },
      };
      downloadFile(`${repoId}-report.json`, JSON.stringify(report, null, 2), 'application/json');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    setOpen(false);
    if (!repoId || busy) return;
    setBusy(true);
    try {
      const hotspots = await cached(['hotspots', repoId], () => api.getHotspots(repoId));
      const csv = toCsv(
        [
          'file', 'module', 'language', 'loc', 'complexity', 'revisions', 'lines_added',
          'lines_deleted', 'bug_fixes', 'reverts', 'churn', 'test_signal', 'risk',
        ],
        hotspots.map((h) => [
          h.path, h.module, h.language, h.loc, h.complexity, h.revisions, h.linesAdded,
          h.linesDeleted, h.bugFixes, h.reverts, h.churnLevel, h.testSignal, h.risk,
        ]),
      );
      downloadFile(`${repoId}-hotspots.csv`, csv, 'text/csv');
    } finally {
      setBusy(false);
    }
  };

  const itemCls =
    'flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs text-dim transition-colors hover:bg-panel hover:text-ink';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
      >
        <Download aria-hidden className="size-3.5" />
        Export
      </button>
      {open && (
        <div role="menu" aria-label="Export report" className="absolute right-0 z-40 mt-1.5 w-56 overflow-hidden rounded-md border border-edge bg-raised shadow-xl">
          <button role="menuitem" type="button" onClick={exportPdf} className={itemCls}>
            <FileText aria-hidden className="mt-0.5 size-3.5 shrink-0 text-faint" />
            <span>
              <span className="block text-ink">PDF report</span>
              <span className="block text-2xs text-faint">All sections · opens print dialog</span>
            </span>
          </button>
          <button role="menuitem" type="button" onClick={exportJson} className={itemCls}>
            <FileJson aria-hidden className="mt-0.5 size-3.5 shrink-0 text-faint" />
            <span>
              <span className="block text-ink">JSON report</span>
              <span className="block text-2xs text-faint">{busy ? 'Preparing…' : 'Full analysis dataset'}</span>
            </span>
          </button>
          <button role="menuitem" type="button" onClick={exportCsv} className={itemCls}>
            <FileSpreadsheet aria-hidden className="mt-0.5 size-3.5 shrink-0 text-faint" />
            <span>
              <span className="block text-ink">CSV</span>
              <span className="block text-2xs text-faint">Hotspot metrics</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
