"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  totalPages,
  currentPage,
  setCurrentPage,
  startIndex,
  endIndex,
  totalItems,
  itemsPerPage,
}) {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      {/* Desktop Pagination */}
      {totalPages > 1 && (
        <div className='hidden md:block px-6 py-4 border-t border-gray-200'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-sm text-gray-600'>
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} contractors
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                <ChevronLeft className='w-4 h-4 mr-1' />
                Previous
              </button>

              <div className='flex items-center gap-1'>
                {renderPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={`dots-${index}`} className='px-2 text-gray-400'>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                Next
                <ChevronRight className='w-4 h-4 ml-1' />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className='md:hidden bg-white border border-gray-200 rounded-lg p-4 mt-4'>
          <div className='flex flex-col items-center gap-4'>
            <div className='text-sm text-gray-600 text-center'>
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} contractors
            </div>
            <div className='flex items-center justify-between w-full'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                <ChevronLeft className='w-4 h-4 mr-1' />
                Prev
              </button>

              <div className='text-sm text-gray-700'>
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
                Next
                <ChevronRight className='w-4 h-4 ml-1' />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
