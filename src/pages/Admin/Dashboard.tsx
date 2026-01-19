import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Package,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  MessageSquare,
  Clock,
  Zap,
  Award,
  BarChart3,
  ArrowUpRight,
  Plus,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/api/dashboardApi';
import { API_BASE_URL } from '@/lib/apiConfig';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend: 'up' | 'down';
}

interface DashboardData {
  stats: {
    articles: {
      total: number;
      published: number;
      drafts: number;
      change: string;
    };
    projects: {
      total: number;
      published: number;
      drafts: number;
      change: string;
    };
    timeline: {
      total: number;
    };
    interests: {
      total: number;
    };
    techSkills: {
      total: number;
    };
    users: {
      total: number;
      change: string;
    };
    engagement: {
      views: number;
      rate: string;
      change: string;
    };
  };
  recentActivity: Array<{
    id: string;
    title: string;
    type: 'article' | 'project';
    date: string;
    status: 'draft' | 'published';
    author: string;
  }>;
}

const Dashboard = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/dashboard/enhanced/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchDashboardData();
    }
  }, [token]);
  
  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  // Transform dashboard stats to UI format
  const statsCards = dashboardData ? [
    {
      title: "Total Articles",
      value: dashboardData.stats.articles.total.toString(),
      change: dashboardData.stats.articles.change,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      trend: 'up' as 'up' | 'down'
    },
    {
      title: "Active Projects",
      value: dashboardData.stats.projects.total.toString(),
      change: dashboardData.stats.projects.change,
      icon: Package,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      trend: 'up' as 'up' | 'down'
    },
    {
      title: "Timeline Items",
      value: dashboardData.stats.timeline.total.toString(),
      change: "+0",
      icon: Calendar,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      trend: 'up' as 'up' | 'down'
    },
    {
      title: "Tech Skills",
      value: dashboardData.stats.techSkills.total.toString(),
      change: "+0",
      icon: FileText,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      trend: 'up' as 'up' | 'down'
    }
  ] : [];



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-success/20 text-success border-success/30">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: diffInDays > 365 ? 'numeric' : undefined 
    });
  };

  return (
    <>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="md:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground/60">
            {getTimeBasedGreeting()}, <span className="text-gradient">
              {user?.username || 'Admin'}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center justify-end">
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span>Updated just now</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            Error loading dashboard: {error}
          </div>
        ) : dashboardData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
                className="group card-hover"
              >
                <Card className="glass border border-border hover:border-primary/30 transition-all duration-300 h-full overflow-hidden relative">
                  <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`}>
                        <ArrowUpRight className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                        {stat.change}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-0">
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-muted-foreground text-sm">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No dashboard data available
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <span className="text-foreground/60">Recent Activity</span>
              </h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </div>
            
            <Card className="glass border border-border h-full">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {dashboardData?.recentActivity.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            item.type === 'article' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-secondary/20 text-secondary'
                          }`}>
                            {item.type === 'article' ? (
                              <FileText className="w-5 h-5" />
                            ) : (
                              <Package className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                            <p className="text-xs text-muted-foreground/70">by {item.author}</p>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    </motion.div>
                  )) || <div className="p-4 text-center text-muted-foreground">No recent activity</div>}
                </div>
              </CardContent>
            </Card>
          </div>

        </motion.div>

      </div>
    </>
  );
};

export default Dashboard;