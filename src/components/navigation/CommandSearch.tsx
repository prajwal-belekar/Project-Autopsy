import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import {
  useArchitecture,
  useFindings,
  useGitForensics,
  useHotspots,
  useIssues,
  usePullRequests,
} from '../../hooks/useQueries';
import { fmtDate } from '../../utils/format';

interface Result {
  id: string;
  group: string;
  title: string;
  sub: string;
  to: string;
}

/**
 * Global repository search. All entries resolve to routes under the active
 * /repository/:repositoryId workspace — the id comes from the route param.
 */
export function CommandSearch() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const { repoId = '' } = useParams();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const dq = useDebounce(q, 120);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const hotspots = useHotspots(repoId);
  const architecture = useArchitecture(repoId);
  const git = useGitForensics(repoId);
  const findings = useFindings(repoId);
  const issues = useIssues(repoId);
  const prs = usePullRequests(repoId);

  const index = useMemo<Result[]>(() => {
    const repo = repoId ? `/repository/${repoId}` : '';
    const entries: Result[] = [];
    (hotspots.data ?? []).forEach((h) =>
      entries.push({
        id: `f-${h.path}`,
        group: 'Files',
        title: h.path,
        sub: `${h.module} · risk ${h.risk} · ${h.revisions} revisions`,
        to: `${repo}/file/${h.path}`,
      }),
    );
    (architecture.data?.graphModules ?? []).forEach((m) =>
      entries.push({
        id: `m-${m.id}`,
        group: 'Modules',
        title: m.name,
        sub: `${m.layer} layer · ${m.files} files`,
        to: `${repo}/architecture`,
      }),
    );
    (git.data?.recentCommits ?? []).forEach((c) =>
      entries.push({
        id: `c-${c.hash}`,
        group: 'Commits',
        title: c.message,
        sub: `${c.hash} · ${fmtDate(c.date)} · ${c.type}`,
        to: `${repo}/git`,
      }),
    );
    (findings.data ?? []).forEach((f) =>
      entries.push({
        id: `fd-${f.id}`,
        group: 'Findings',
        title: f.title,
        sub: `${f.severity} · ${f.area}`,
        to: `${repo}/findings`,
      }),
    );
    (issues.data?.top ?? []).forEach((i) =>
      entries.push({
        id: `i-${i.id}`,
        group: 'Issues',
        title: `#${i.number} ${i.title}`,
        sub: `${i.state} · ${i.label} · ${i.ageDays}d`,
        to: `${repo}/issues`,
      }),
    );
    (prs.data?.top ?? []).forEach((p) =>
      entries.push({
        id: `p-${p.id}`,
        group: 'Pull Requests',
        title: `#${p.number} ${p.title}`,
        sub: `${p.state} · open ${p.openDays}d · ${p.files} files`,
        to: `${repo}/issues`,
      }),
    );
    return entries;
  }, [repoId, hotspots.data, architecture.data, git.data, findings.data, issues.data, prs.data]);

  const results = useMemo(() => {
    const query = dq.trim().toLowerCase();
    if (!query) return [];
    return index
      .filter((r) => r.title.toLowerCase().includes(query) || r.sub.toLowerCase().includes(query))
      .slice(0, 12);
  }, [dq, index]);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setIdx(0), [dq]);

  const go = (r?: Result) => {
    const target = r ?? results[idx];
    if (!target) return;
    setOpen(false);
    navigate(target.to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search repository"
            className="mx-auto mt-[10vh] w-full max-w-xl overflow-hidden rounded-lg border border-edge bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search repository... files, modules, commits, findings, issues, PRs"
              aria-label="Search repository"
              className="w-full border-b border-edge-soft bg-transparent px-4 py-3 text-[14px] text-ink placeholder:text-faint focus:outline-none"
            />
            <div className="max-h-[50vh] overflow-y-auto p-1.5">
              {!dq.trim() && (
                <p className="px-3 py-8 text-center text-xs text-faint">
                  Search across files, modules, commits, findings, issues, and pull requests.
                </p>
              )}
              {dq.trim() && results.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-faint">No results for “{dq}”.</p>
              )}
              {results.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => go(r)}
                  onMouseEnter={() => setIdx(i)}
                  className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                    i === idx ? 'bg-raised' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-13 text-ink">{r.title}</span>
                    <span className="block truncate font-mono text-2xs text-faint">{r.sub}</span>
                  </span>
                  <span className="shrink-0 rounded border border-edge-soft px-1.5 py-0.5 text-2xs text-faint">
                    {r.group}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-edge-soft px-4 py-2 text-2xs text-faint">
              ↑↓ navigate · Enter opens · Esc closes
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
