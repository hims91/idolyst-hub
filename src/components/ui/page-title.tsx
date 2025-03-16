
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
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="text-muted-foreground mt-2">{text}</p>}
    </div>
  );
};
