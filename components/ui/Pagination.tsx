export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="mt-4 flex items-center justify-end gap-1" aria-label="Pagination">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`rounded-md px-3 py-1.5 text-sm ${
            p === page ? "bg-navy text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50"
      >
        Next
      </button>
    </nav>
  );
}
