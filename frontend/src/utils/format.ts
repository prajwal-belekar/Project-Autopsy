export const fmtInt = (n: number): string => n.toLocaleString('en-US');

export const fmtSigned = (n: number): string =>
  `${n >= 0 ? '+' : '−'}${Math.abs(n).toLocaleString('en-US')}`;

export const fmtK = (n: number): string =>
  Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const fmtDay = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.round(diff / 60000));
  if (min < 60) return `${min} min ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function daysSince(iso: string, now = Date.now()): number {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 86400000));
}

export const pct = (num: number, den: number): string =>
  den === 0 ? '—' : `${(Math.round((num / den) * 1000) / 10).toFixed(1)}%`;
