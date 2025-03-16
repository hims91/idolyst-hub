
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const isMobile = window.innerWidth < 640;
  
  // Calculate which page numbers to display
  const getPageNumbers = () => {
    const displayedPages = isMobile ? 3 : 5;
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= displayedPages) {
      // Display all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first and last page
      pages.push(1);
      
      // Current page is near the start
      if (currentPage <= 3) {
        for (let i = 2; i <= Math.min(displayedPages - 1, totalPages - 1); i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      } 
      // Current page is near the end
      else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis');
        for (let i = Math.max(2, totalPages - (displayedPages - 2)); i < totalPages; i++) {
          pages.push(i);
        }
      } 
      // Current page is in the middle
      else {
        pages.push('ellipsis');
        const offset = Math.floor((displayedPages - 3) / 2);
        for (let i = currentPage - offset; i <= currentPage + offset; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex justify-center items-center", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center mx-1 space-x-1">
        {pageNumbers.map((page, i) => 
          page === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className="w-9 h-9"
            >
              {page}
            </Button>
          )
        )}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
