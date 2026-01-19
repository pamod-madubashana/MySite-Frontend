import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import ProtectedRoute from "./components/RouteProtector";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Articles from "./pages/Articles";
import NotFound from "./pages/NotFound";
import Dashboard from './pages/Admin/Dashboard';
import ArticleManager from "./pages/Admin/ArticleManager";
import SettingsPage from "./pages/Admin/Settings";
import ProjectManager from "./pages/Admin/ProjectManager";
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TimelineManager from './pages/Admin/TimelineManager';
import TechSkillsManager from './pages/Admin/TechSkillsManager';
import InterestsManager from './pages/Admin/InterestsManager';
import TechStackManager from './pages/Admin/TechStackManager';

const queryClient = new QueryClient();

const App = () => (
  <SettingsProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="dark">
            <Toaster />
            <Sonner />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </SettingsProvider>
);

export default App;
