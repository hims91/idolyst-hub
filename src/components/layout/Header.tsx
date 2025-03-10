
import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">{title}</h1>
        
        <div className="flex items-center space-x-4">
          <div className={cn(
            "relative w-64 transition-all duration-200",
            "focus-within:w-80"
          )}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className={cn(
                "block w-full pl-10 pr-3 py-2 text-sm",
                "border rounded-md bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                "transition duration-200"
              )}
            />
          </div>
          
          <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
