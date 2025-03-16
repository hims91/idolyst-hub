
import React from 'react';

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export const Shell: React.FC<ShellProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {children}
    </div>
  );
};
