import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  ariaLabel?: string;
  minTableWidth?: number;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  defaultSort,
  pageSize = 10,
  onRowClick,
  emptyTitle = 'No results',
  emptyMessage = 'No data matches the current filters.',
  ariaLabel,
  minTableWidth = 640,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(defaultSort ?? null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const val = col.sortValue;
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      const cmp =
        typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const paged = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' },
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-13"
          style={{ minWidth: minTableWidth }}
          aria-label={ariaLabel}
        >
          <thead>
            <tr className="border-b border-edge">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-3 py-2 text-2xs font-medium uppercase tracking-wider text-faint',
                    c.align === 'right' ? 'text-right' : 'text-left',
                  )}
                  style={c.width ? { width: c.width } : undefined}
                  aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        'inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-dim',
                        sort?.key === c.key && 'text-dim',
                      )}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp aria-hidden className="size-3" />
                        ) : (
                          <ArrowDown aria-hidden className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  'border-b border-edge-soft/60 last:border-0',
                  onRowClick && 'cursor-pointer transition-colors hover:bg-panel',
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn('px-3 py-2 align-middle', c.align === 'right' ? 'text-right' : 'text-left')}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t border-edge-soft px-3 py-2 text-2xs text-faint">
          <span>
            Showing {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of{' '}
            {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Previous page"
              className="rounded border border-edge-soft p-1 transition-colors hover:bg-raised disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden className="size-3.5" />
            </button>
            <span className="px-1 font-mono">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              aria-label="Next page"
              className="rounded border border-edge-soft p-1 transition-colors hover:bg-raised disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight aria-hidden className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
