import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users,
  BarChart3,
  Package,
  Shield,
  Calendar,
  Code,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  isActive?: boolean;
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  // Always keep sidebar open
  const sidebarOpen = true;
  

  const location = useLocation();
  const { logout, user } = useAuth();
  


  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard
    },
    {
      title: 'Articles',
      path: '/admin/articles',
      icon: FileText
    },
    {
      title: 'Projects',
      path: '/admin/projects',
      icon: Package
    },
    {
      title: 'Timeline',
      path: '/admin/timeline',
      icon: Calendar
    },
    {
      title: 'Tech Skills',
      path: '/admin/tech-skills',
      icon: Code
    },
    {
      title: 'Tech Stack',
      path: '/admin/tech-stack',
      icon: Package
    },
    {
      title: 'Interests',
      path: '/admin/interests',
      icon: Heart
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  // Close sidebar when route changes (mobile)
  // Note: sidebar is always open in this implementation
  useEffect(() => {
    // No-op since sidebar is always open
  }, [location]);

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: 0,
          width: '280px'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 bg-popover backdrop-blur-xl border-r border-border flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground/60">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">Portfolio Manager</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </Button>

        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-foreground/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/30 text-primary' 
                    : 'group-hover:bg-muted text-current'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap font-medium"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center font-bold">
              {user?.username === 'pamod' ? (
                <img 
                  src="/favicon.ico" 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.username?.charAt(0)?.toUpperCase() || 'A'
              )}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate text-muted-foreground">
                    {user?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Administrator
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full flex items-center gap-2 border-border text-foreground/60 hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-foreground/60">Logout</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-[280px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-popover/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-muted"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground/60">
                  {navItems.find(item => isActiveRoute(item.path))?.title || 'Dashboard'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full rounded-full bg-[#00cc88] animate-pulse"></div>
                <span>Online</span>
              </div>
              
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 pt-0 md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;