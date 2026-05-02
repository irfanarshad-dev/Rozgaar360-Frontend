'use client';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * Modern, professional pagination component for worker profiles
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {boolean} loading - Loading state for API calls
 * @param {number} siblingCount - Number of page buttons to show on each side of current page
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
  siblingCount = 1,
}) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Generate page numbers array with ellipsis
  const generatePageNumbers = () => {
    const pages = [];
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    // Always show first page
    pages.push(1);

    // Show left ellipsis if needed
    if (showLeftEllipsis) {
      pages.push('ellipsis-left');
    } else if (leftSiblingIndex === 2) {
      pages.push(2);
    }

    // Show middle pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Show right ellipsis if needed
    if (showRightEllipsis) {
      pages.push('ellipsis-right');
    } else if (rightSiblingIndex === totalPages - 1) {
      pages.push(totalPages - 1);
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  const handlePageClick = (page) => {
    if (page === currentPage || loading) return;
    onPageChange(page);
    // Smooth scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      handlePageClick(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      handlePageClick(currentPage + 1);
    }
  };

  const isPrevDisabled = currentPage === 1 || loading;
  const isNextDisabled = currentPage === totalPages || loading;

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
    if (event.key === 'Home') {
      event.preventDefault();
      handlePageClick(1);
    }
    if (event.key === 'End') {
      event.preventDefault();
      handlePageClick(totalPages);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      aria-busy={loading}
      onKeyDown={handleKeyDown}
      className="relative flex w-full items-center justify-center px-4 py-8"
    >
      <span className="sr-only" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex w-full max-w-2xl items-center justify-center">
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm sm:gap-2 sm:px-3">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={isPrevDisabled}
          aria-label="Go to previous page"
          className={`
            group relative flex items-center justify-center gap-1.5 sm:gap-2
            h-10 sm:h-11 px-3.5 sm:px-4
            rounded-xl
            text-xs sm:text-sm font-semibold tracking-tight
            transition-all duration-200
            border
            ${
              isPrevDisabled
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-slate-900/5 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-900/10 hover:text-slate-900 hover:shadow-sm active:scale-[0.98]'
            }
          `}
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((page, index) => {
            // Render ellipsis
            if (typeof page === 'string' && page.startsWith('ellipsis')) {
              return (
                <div
                  key={page}
                  className="flex items-center justify-center w-8 h-10 sm:w-10 sm:h-11 text-slate-400"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            // Render page button
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                disabled={loading}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  relative flex items-center justify-center
                  w-9 h-10 sm:w-11 sm:h-11
                  rounded-xl
                  text-xs sm:text-sm font-semibold tracking-tight
                  transition-all duration-200
                  border
                  ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white border-transparent shadow-md shadow-blue-200/60 scale-[1.03] z-10'
                      : 'bg-slate-900/5 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-900/10 hover:text-slate-900 hover:shadow-sm active:scale-[0.98]'
                  }
                  ${loading ? 'cursor-wait opacity-60' : ''}
                `}
              >
                {page}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl ring-2 ring-blue-400/50 ring-offset-2 ring-offset-white motion-safe:animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          aria-label="Go to next page"
          className={`
            group relative flex items-center justify-center gap-1.5 sm:gap-2
            h-10 sm:h-11 px-3.5 sm:px-4
            rounded-xl
            text-xs sm:text-sm font-semibold tracking-tight
            transition-all duration-200
            border
            ${
              isNextDisabled
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-slate-900/5 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-900/10 hover:text-slate-900 hover:shadow-sm active:scale-[0.98]'
            }
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        </div>
      </div>

      {/* Page Info - Mobile Only */}
      <div className="sm:hidden absolute bottom-2 left-1/2 -translate-x-1/2">
        <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </nav>
  );
}
