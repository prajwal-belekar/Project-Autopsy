import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  FlaskConical,
  Flame,
  Gauge,
  GitBranch,
  GitPullRequest,
  History,
  LayoutDashboard,
  Network,
  SearchCheck,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '', label: 'Overview', icon: LayoutDashboard },
  { to: 'code-health', label: 'Code Health', icon: Gauge },
  { to: 'git', label: 'Git Forensics', icon: GitBranch },
  { to: 'friction', label: 'Development Friction', icon: Waves },
  { to: 'hotspots', label: 'Hotspots', icon: Flame },
  { to: 'architecture', label: 'Architecture', icon: Network },
  { to: 'debt', label: 'Technical Debt', icon: ClipboardList },
  { to: 'testing', label: 'Testing', icon: FlaskConical },
  { to: 'documentation', label: 'Documentation', icon: BookOpen },
  { to: 'issues', label: 'Issues & PRs', icon: GitPullRequest },
  { to: 'evolution', label: 'Evolution', icon: History },
  { to: 'findings', label: 'Findings', icon: SearchCheck },
];

export function Brand() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-edge-soft px-4">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <rect width="32" height="32" rx="7" fill="#151B23" stroke="#27313D" />
        <circle cx="16" cy="16" r="8.5" fill="none" stroke="#22D3EE" strokeWidth="2.5" />
        <line x1="16" y1="10.5" x2="16" y2="21.5" stroke="#22D3EE" strokeWidth="2.5" />
      </svg>
      <span className="text-[13px] font-semibold tracking-[0.14em] text-ink">PROJECT AUTOPSY</span>
    </div>
  );
}

export function Sidebar({
  repoId,
  repoName,
  branch,
  onNavigate,
}: {
  repoId: string;
  repoName?: string;
  branch?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-edge bg-panel">
      <Brand />
      <div className="mx-3 mt-3 rounded-md border border-edge-soft bg-surface px-3 py-2.5">
        <p className="truncate font-mono text-13 text-ink" title={repoName}>
          {repoName ?? '…'}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 font-mono text-2xs text-faint">
          <GitBranch aria-hidden className="size-3" />
          {branch ?? '—'}
        </p>
      </div>
      <nav aria-label="Repository sections" className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to ? `/${repoId}/${to}` : `/${repoId}`}
            end={to === ''}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-13 transition-colors',
                isActive
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-dim hover:bg-surface hover:text-ink',
              )
            }
          >
            <Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-edge-soft px-4 py-3 text-2xs leading-relaxed text-faint">
        Deterministic analysis · v0.1.0
      </div>
    </div>
  );
}
