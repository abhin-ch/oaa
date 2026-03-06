'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
}

export function Pagination({ page, totalPages, onPageChange, label }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border-default px-6 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-7 w-7 items-center justify-center border border-border-default text-xs text-text-tertiary transition-colors hover:text-text-primary disabled:opacity-40"
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-7 w-7 items-center justify-center border text-xs font-semibold ${
              p === page
                ? 'border-text-primary bg-text-primary text-text-inverse'
                : 'border-border-default text-text-tertiary transition-colors hover:text-text-primary'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-7 w-7 items-center justify-center border border-border-default text-xs text-text-tertiary transition-colors hover:text-text-primary disabled:opacity-40"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
