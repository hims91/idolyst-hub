
import React from 'react';

interface PageTitleProps {
  heading: string;
  text?: string;
  className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ 
  heading, 
  text, 
  className = '' 
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="mt-2 text-muted-foreground">{text}</p>}
    </div>
  );
};
