import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import ProtectedRoute from "./components/RouteProtector";
import ScrollToTop from "./components/ScrollToTop";
import DynamicPageBackground from "./components/DynamicPageBackground";
import PersistentCommandCore from "./components/PersistentCommandCore";
import MagneticCursor from "./components/MagneticCursor";
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
const APP_BOOT_LOADER_ID = "app-boot-loader";
const APP_BOOT_LOADER_HIDDEN_CLASS = "app-boot-loader-hidden";
const APP_BOOT_LOADING_CLASS = "app-boot-loading";

type RouteAxis = "horizontal" | "vertical";
type RouteDirection = "forward" | "backward";

interface RoutePattern {
  regex: RegExp;
  rank: number;
}

const PUBLIC_ROUTE_PATTERNS: RoutePattern[] = [
  { regex: /^\/$/, rank: 0 },
  { regex: /^\/about\/?$/, rank: 1 },
  { regex: /^\/projects\/?$/, rank: 2 },
  { regex: /^\/projects\/[^/]+\/?$/, rank: 2 },
  { regex: /^\/articles\/?$/, rank: 3 },
  { regex: /^\/articles\/[^/]+\/?$/, rank: 3 },
  { regex: /^\/login\/?$/, rank: 4 },
  { regex: /^\/register\/?$/, rank: 5 },
];

const ADMIN_ROUTE_PATTERNS: RoutePattern[] = [
  { regex: /^\/admin\/?$/, rank: 0 },
  { regex: /^\/admin\/articles\/?$/, rank: 1 },
  { regex: /^\/admin\/projects\/?$/, rank: 2 },
  { regex: /^\/admin\/timeline\/?$/, rank: 3 },
  { regex: /^\/admin\/tech-skills\/?$/, rank: 4 },
  { regex: /^\/admin\/tech-stack\/?$/, rank: 5 },
  { regex: /^\/admin\/interests\/?$/, rank: 6 },
  { regex: /^\/admin\/messages\/?$/, rank: 7 },
  { regex: /^\/admin\/settings\/?$/, rank: 8 },
];

const getRouteRank = (pathname: string, patterns: RoutePattern[]): number | null => {
  for (const pattern of patterns) {
    if (pattern.regex.test(pathname)) {
      return pattern.rank;
    }
  }

  return null;
};

const getRouteAxis = (pathname: string): RouteAxis => {
  return pathname.startsWith("/admin") ? "vertical" : "horizontal";
};

const getTransitionRank = (pathname: string, axis: RouteAxis): number | null => {
  return axis === "vertical"
    ? getRouteRank(pathname, ADMIN_ROUTE_PATTERNS)
    : getRouteRank(pathname, PUBLIC_ROUTE_PATTERNS);
};

const RouteFallback = () => (
  <div className="fixed inset-0 overflow-hidden bg-background">
    <DynamicPageBackground />
    <div className="pointer-events-none absolute inset-x-[-18%] bottom-[18%] h-px rotate-[-4deg] bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
    <div className="pointer-events-none absolute inset-x-[-18%] bottom-[22%] h-px rotate-[5deg] bg-gradient-to-r from-transparent via-secondary/15 to-transparent" />
    <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="relative h-[92px] w-[92px] rounded-full border border-primary/20 bg-primary/10 shadow-[0_0_64px_hsl(var(--primary)/0.24)]">
          <div className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-r-primary/50 border-t-primary" />
          <div className="absolute -inset-2 animate-[spin_1.8s_linear_infinite_reverse] rounded-full border border-transparent border-t-secondary/50" />
          <div className="absolute inset-[33px] rounded-full bg-primary/30 blur-sm" />
        </div>
      </div>
    </div>
  </div>
);

const AppBootstrapGate = ({ children }: { children: ReactNode }) => {
  const { loading } = useSettings();
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsBootstrapped(true);
    }
  }, [loading]);

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }

    const body = document.body;
    const bootLoader = document.getElementById(APP_BOOT_LOADER_ID);
    if (!bootLoader) {
      body.classList.remove(APP_BOOT_LOADING_CLASS);
      return;
    }

    bootLoader.classList.add(APP_BOOT_LOADER_HIDDEN_CLASS);

    const timer = window.setTimeout(() => {
      bootLoader.remove();
      body.classList.remove(APP_BOOT_LOADING_CLASS);
    }, 260);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isBootstrapped]);

  if (!isBootstrapped) {
    return null;
  }

  return <>{children}</>;
};

const App = () => {
  const location = useLocation();
  const { pathname } = location;
  const navigationType = useNavigationType();
  const previousPathRef = useRef(pathname);
  const showCommandCore =
    !pathname.startsWith("/admin") &&
    !/^\/(login|register)\/?$/.test(pathname);

  const transitionMeta = useMemo(() => {
    const currentPath = pathname;
    const previousPath = previousPathRef.current;
    const currentAxis = getRouteAxis(currentPath);
    const previousAxis = getRouteAxis(previousPath);
    const currentRank = getTransitionRank(currentPath, currentAxis);
    const previousRank = getTransitionRank(previousPath, previousAxis);

    let direction: RouteDirection = "forward";

    if (previousPath !== currentPath && previousAxis === currentAxis) {
      if (previousRank !== null && currentRank !== null && previousRank !== currentRank) {
        direction = currentRank > previousRank ? "forward" : "backward";
      } else if (navigationType === "POP") {
        direction = "backward";
      }
    }

    return {
      axis: currentAxis,
      direction,
    };
  }, [pathname, navigationType]);

  useEffect(() => {
    previousPathRef.current = pathname;
  }, [pathname]);

  useLayoutEffect(() => {
    document.documentElement.dataset.routeAxis = transitionMeta.axis;
    document.documentElement.dataset.routeDirection = transitionMeta.direction;
  }, [transitionMeta.axis, transitionMeta.direction]);

  useLayoutEffect(() => {
    const contentNodes = Array.from(document.querySelectorAll<HTMLElement>(".route-transition-content"));
    if (contentNodes.length === 0) {
      return;
    }

    const directionOffset =
      transitionMeta.axis === "horizontal"
        ? transitionMeta.direction === "forward"
          ? "translate3d(56px, 0, 0)"
          : "translate3d(-56px, 0, 0)"
        : transitionMeta.direction === "forward"
          ? "translate3d(0, 42px, 0)"
          : "translate3d(0, -42px, 0)";

    contentNodes.forEach((node) => {
      node.style.transition = "none";
      node.style.transform = directionOffset;
      node.style.opacity = "0.92";
      node.style.willChange = "transform";
    });

    const frame = requestAnimationFrame(() => {
      contentNodes.forEach((node) => {
        node.style.transition = "transform 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 520ms ease";
        node.style.transform = "translate3d(0, 0, 0)";
        node.style.opacity = "1";
      });
    });

    const onTransitionEnd = (event: Event) => {
      if (!(event.currentTarget instanceof HTMLElement)) {
        return;
      }

      const node = event.currentTarget;
      node.style.transition = "";
      node.style.willChange = "";
      node.style.opacity = "";
    };

    contentNodes.forEach((node) => {
      node.addEventListener("transitionend", onTransitionEnd, { once: true });
    });

    return () => {
      cancelAnimationFrame(frame);
      contentNodes.forEach((node) => {
        node.style.transition = "";
        node.style.willChange = "";
        node.style.opacity = "";
        node.removeEventListener("transitionend", onTransitionEnd);
      });
    };
  }, [pathname, transitionMeta.axis, transitionMeta.direction]);

  return (
  <SettingsProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="dark">
            <MagneticCursor />
            <Toaster />
            <Sonner />
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <AppBootstrapGate>
                {showCommandCore && <PersistentCommandCore />}
                <div
                  key={pathname}
                  className={`route-fallback-enter route-fallback-enter-${transitionMeta.axis}-${transitionMeta.direction}`}
                >
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
              </AppBootstrapGate>
            </Suspense>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </SettingsProvider>
  );
};

export default App;
