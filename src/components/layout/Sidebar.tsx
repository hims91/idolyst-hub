
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  Award, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  LogIn,
  UserPlus,
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/ui/UserAvatar';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  // Close sidebar on mobile when changing routes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [location.pathname, isMobile]);

  // Main navigation items
  const navigationItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: DollarSign, label: 'Funding', path: '/funding' },
    { icon: Award, label: 'Rewards', path: '/rewards' },
    { icon: BarChart3, label: 'Insights', path: '/insights' },
  ];
  
  // Admin and settings items
  const secondaryItems = [
    ...(user && user.role === 'admin' ? [{ icon: Settings, label: 'Admin', path: '/admin' }] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Mobile sidebar toggle button
  const SidebarToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-3 left-3 z-50 bg-background/80 backdrop-blur-sm"
      onClick={toggleSidebar}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  // Sidebar content - rendered for both mobile and desktop
  const SidebarContent = () => (
    <>
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="bg-primary h-8 w-8 flex items-center justify-center rounded-md text-primary-foreground font-bold text-lg mr-2">
            I
          </span>
          <span className="font-semibold text-lg">Idolyst</span>
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
          </Button>
        )}
      </div>

      <div className="px-2 py-2 flex-1 overflow-auto">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location.pathname === item.path 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
              {item.label === 'Events' && (
                <Badge variant="outline" className="ml-auto">New</Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-sidebar-border">
          <nav className="space-y-1">
            {secondaryItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  location.pathname === item.path 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        {user ? (
          <div className="flex items-center justify-between">
            <Link 
              to="/profile" 
              className="flex items-center space-x-3 flex-1 overflow-hidden"
            >
              <UserAvatar name={user.name} src={user.avatar} size="sm" />
              <div className="truncate">
                <div className="font-medium truncate">{user.name}</div>
                <div className="text-xs text-sidebar-foreground/70 truncate">{user.role}</div>
              </div>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="ml-2 h-9 w-9 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/register" className="w-full">
              <Button variant="default" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <SidebarToggle />
      
      {/* Desktop sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 240 : 0 }}
        className={cn(
          "hidden md:flex flex-col sticky top-0 h-screen border-r border-sidebar-border bg-sidebar",
          "transition-width overflow-hidden z-30",
          isOpen ? "min-w-[240px]" : "min-w-0",
        )}
      >
        <SidebarContent />
      </motion.div>
      
      {/* Mobile sidebar with backdrop overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={toggleSidebar}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="fixed top-0 left-0 bottom-0 w-[240px] flex flex-col bg-sidebar border-r border-sidebar-border z-50 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
