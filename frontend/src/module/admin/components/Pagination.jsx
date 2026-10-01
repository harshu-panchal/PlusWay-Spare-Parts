import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Page numbers to show: first, last, and a window around the current page,
// with "…" for gaps. e.g. [1, "…", 4, 5, 6, "…", 20]
const pageItems = (page, pages) => {
    const items = [];
    const window = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
    const sorted = [...window].sort((a, b) => a - b);
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) items.push(p - sorted[i - 1] === 2 ? p - 1 : `gap-${p}`);
        items.push(p);
    });
    return items;
};

/**
 * Table footer pagination: "Showing 1–10 of 213", rows-per-page selector and
 * Previous / page numbers / Next.
 */
const Pagination = ({ page, pages, total, pageSize, pageSizes = [10, 25, 50], onPageChange, onPageSizeChange, disabled = false }) => {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    const buttonBase =
        "min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                    Showing <strong className="text-gray-900">{from.toLocaleString()}–{to.toLocaleString()}</strong> of{" "}
                    <strong className="text-gray-900">{total.toLocaleString()}</strong>
                </span>
                {onPageSizeChange && (
                    <label className="flex items-center gap-2">
                        Rows
                        <select
                            value={pageSize}
                            disabled={disabled}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-500">
                            {pageSizes.map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {pages > 1 && (
                <nav className="flex items-center gap-1" aria-label="Pagination">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={disabled || page <= 1}
                        className={`${buttonBase} text-gray-600 hover:bg-gray-100`}
                        aria-label="Previous page">
                        <ChevronLeft size={16} />
                    </button>
                    {pageItems(page, pages).map((item) =>
                        typeof item === "string" ? (
                            <span key={item} className="px-1 text-gray-400 text-sm">…</span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                disabled={disabled}
                                aria-current={item === page ? "page" : undefined}
                                className={`${buttonBase} ${item === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                                {item}
                            </button>
                        ),
                    )}
                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={disabled || page >= pages}
                        className={`${buttonBase} text-gray-600 hover:bg-gray-100`}
                        aria-label="Next page">
                        <ChevronRight size={16} />
                    </button>
                </nav>
            )}
        </div>
    );
};

export default Pagination;
