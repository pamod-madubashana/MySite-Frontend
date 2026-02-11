import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import ProtectedRoute from "./components/RouteProtector";
import ScrollToTop from "./components/ScrollToTop";
import DynamicPageBackground from "./components/DynamicPageBackground";
import Index from "./pages/Index";

const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Articles = lazy(() => import("./pages/Articles"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const ArticleManager = lazy(() => import("./pages/Admin/ArticleManager"));
const SettingsPage = lazy(() => import("./pages/Admin/Settings"));
const ProjectManager = lazy(() => import("./pages/Admin/ProjectManager"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const TimelineManager = lazy(() => import("./pages/Admin/TimelineManager"));
const TechSkillsManager = lazy(() => import("./pages/Admin/TechSkillsManager"));
const InterestsManager = lazy(() => import("./pages/Admin/InterestsManager"));
const TechStackManager = lazy(() => import("./pages/Admin/TechStackManager"));
const MessagesManager = lazy(() => import("./pages/Admin/MessagesManager"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="relative min-h-screen bg-background">
    <DynamicPageBackground />
    <div className="relative z-10 flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  </div>
);

const App = () => {
  const location = useLocation();

  return (
  <SettingsProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="dark">
            <Toaster />
            <Sonner />
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <div key={location.pathname} className="route-fallback-enter">
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <Dashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/articles" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <ArticleManager />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <SettingsPage />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/projects" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <ProjectManager />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/timeline" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <TimelineManager />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/tech-skills" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <TechSkillsManager />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/tech-stack" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <TechStackManager />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/interests" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <InterestsManager />
                      </AdminLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/admin/messages"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout>
                        <MessagesManager />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </div>
            </Suspense>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </SettingsProvider>
  );
};

export default App;
