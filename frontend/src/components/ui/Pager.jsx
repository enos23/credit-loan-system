import { ChevronLeft, ChevronRight } from 'lucide-react';

// Page is 1-indexed. Hides itself entirely if there's nothing to paginate.
const Pager = ({ page, pageSize, totalCount, totalPages, onPageChange }) => {
    if (totalCount === 0 || totalPages <= 1) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);

    return (
        <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500 font-medium">
                {from}–{to} din {totalCount}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Pagina precedentă"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-slate-700 min-w-[60px] text-center">
                    {page} / {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Pagina următoare"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pager;
