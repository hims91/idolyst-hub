
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Rocket, 
  Calendar, 
  Award, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ease-in-out",
        isActive
          ? "bg-secondary text-primary"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="ml-3 overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      className="flex flex-col h-screen border-r bg-sidebar"
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-semibold"
            >
              Idolyst
            </motion.div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <nav className="space-y-1">
          <SidebarItem to="/" icon={Home} label="Home" isCollapsed={isCollapsed} />
          <SidebarItem to="/community" icon={Users} label="Community" isCollapsed={isCollapsed} />
          <SidebarItem to="/funding" icon={Rocket} label="Funding" isCollapsed={isCollapsed} />
          <SidebarItem to="/events" icon={Calendar} label="Events" isCollapsed={isCollapsed} />
          <SidebarItem to="/rewards" icon={Award} label="Rewards" isCollapsed={isCollapsed} />
          <SidebarItem to="/insights" icon={BarChart3} label="Insights" isCollapsed={isCollapsed} />
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <Link to="/profile" className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3 overflow-hidden"
            >
              <div className="text-sm font-medium">Profile</div>
            </motion.div>
          )}
        </Link>
      </div>
    </motion.div>
  );
};

export default Sidebar;
