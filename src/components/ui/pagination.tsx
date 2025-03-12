
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithRef<'a'> & { isActive?: boolean; disabled?: boolean }
>(({ className, isActive, disabled, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      'relative inline-flex items-center px-4 py-2 text-sm font-medium',
      isActive 
        ? 'z-10 bg-primary text-primary-foreground' 
        : 'bg-background text-foreground hover:bg-accent',
      disabled && 'pointer-events-none opacity-50',
      className
    )}
    {...props}
  />
));

PaginationItem.displayName = 'PaginationItem';

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationItem
          key={i}
          onClick={() => onPageChange(i)}
          isActive={i === currentPage}
        >
          {i}
        </PaginationItem>
      );
    }

    return buttons;
  };

  return (
    <nav className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {currentPage > 3 && (
        <>
          <PaginationItem onClick={() => onPageChange(1)}>1</PaginationItem>
          {currentPage > 4 && <span className="px-2">...</span>}
        </>
      )}
      
      {renderPageButtons()}
      
      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && <span className="px-2">...</span>}
          <PaginationItem onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationItem>
        </>
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
