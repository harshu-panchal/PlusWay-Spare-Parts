import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, onPageChange }) => {
    if (pages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
    }

    // Logic for displaying limited page numbers if there are many pages
    const renderPageNumbers = () => {
        if (pages <= 7) {
            return pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all border ${page === number
                            ? "bg-primary border-primary text-white shadow-lg shadow-orange-500/20"
                            : "bg-white border-gray-100 text-gray-500 hover:border-primary hover:text-primary"
                        }`}
                >
                    {number}
                </button>
            ));
        }

        // Complex pagination with ellipses
        const visiblePages = [];
        if (page <= 4) {
            visiblePages.push(...pageNumbers.slice(0, 5), '...', pages);
        } else if (page >= pages - 3) {
            visiblePages.push(1, '...', ...pageNumbers.slice(pages - 5));
        } else {
            visiblePages.push(1, '...', page - 1, page, page + 1, '...', pages);
        }

        return visiblePages.map((number, index) => (
            <React.Fragment key={index}>
                {number === '...' ? (
                    <span className="w-10 h-10 flex items-center justify-center text-gray-400">
                        ...
                    </span>
                ) : (
                    <button
                        onClick={() => onPageChange(number)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all border ${page === number
                                ? "bg-primary border-primary text-white shadow-lg shadow-orange-500/20"
                                : "bg-white border-gray-100 text-gray-500 hover:border-primary hover:text-primary"
                            }`}
                    >
                        {number}
                    </button>
                )}
            </React.Fragment>
        ));
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-gray-100 disabled:hover:text-gray-400 transition-all font-bold group"
                title="Previous Page"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center gap-2">
                {renderPageNumbers()}
            </div>

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === pages}
                className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-gray-100 disabled:hover:text-gray-400 transition-all font-bold group"
                title="Next Page"
            >
                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
    );
};

export default Pagination;
