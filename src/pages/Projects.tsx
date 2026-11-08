import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { Search, Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projectApi } from "@/api/projectApi";
import PageSeo from "@/components/seo/PageSeo";
import DynamicPageBackground from "@/components/DynamicPageBackground";

interface Project {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  tags: string[];
  languages: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  status: "draft" | "published";
  thumbnail?: string;
  screenshots?: string[];
  createdAt: string;
  updatedAt: string;
}

interface GithubStats {
  [projectId: string]: {
    stars: number;
    forks: number;
  };
}

interface ProjectsPageCache {
  timestamp: number;
  projects: Project[];
  githubStats: GithubStats;
}

const PROJECTS_PAGE_CACHE_KEY = "projects:page:cache:v1";
const PROJECTS_PAGE_CACHE_TTL = 15 * 60 * 1000;

const getRepoFromGithubUrl = (url: string): { owner: string; repo: string } | null => {
  const sanitizedUrl = url.replace("https://github.com/", "").replace("http://github.com/", "");
  const urlParts = sanitizedUrl.split("/");

  if (urlParts.length < 2) {
    return null;
  }

  return {
    owner: urlParts[0],
    repo: urlParts[1].replace(".git", "")
  };
};

const readProjectsPageCache = (): ProjectsPageCache | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawCache = window.localStorage.getItem(PROJECTS_PAGE_CACHE_KEY);
  if (!rawCache) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawCache) as ProjectsPageCache;
    if (typeof parsed.timestamp !== "number") {
      window.localStorage.removeItem(PROJECTS_PAGE_CACHE_KEY);
      return null;
    }

    const cacheAge = Date.now() - parsed.timestamp;

    if (cacheAge > PROJECTS_PAGE_CACHE_TTL) {
      window.localStorage.removeItem(PROJECTS_PAGE_CACHE_KEY);
      return null;
    }

    if (!Array.isArray(parsed.projects) || typeof parsed.githubStats !== "object" || parsed.githubStats === null) {
      window.localStorage.removeItem(PROJECTS_PAGE_CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(PROJECTS_PAGE_CACHE_KEY);
    return null;
  }
};

const writeProjectsPageCache = (projects: Project[], githubStats: GithubStats) => {
  if (typeof window === "undefined") {
    return;
  }

  const cachePayload: ProjectsPageCache = {
    timestamp: Date.now(),
    projects,
    githubStats
  };

  window.localStorage.setItem(PROJECTS_PAGE_CACHE_KEY, JSON.stringify(cachePayload));
};

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubStats, setGithubStats] = useState<GithubStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroExiting, setHeroExiting] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [heroRemoved, setHeroRemoved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroExiting(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cachedData = readProjectsPageCache();
    if (cachedData) {
      setProjects(cachedData.projects);
      setGithubStats(cachedData.githubStats);
      setLoading(false);
      return;
    }

    let isActive = true;

    const fetchProjectsAndStats = async () => {
      try {
        const data = await projectApi.getProjects();
        const fetchedProjects = data.projects || [];

        if (!isActive) {
          return;
        }

        setProjects(fetchedProjects);

        const stats: GithubStats = {};
        for (const project of fetchedProjects) {
          if (!project.githubUrl) {
            continue;
          }

          const repoDetails = getRepoFromGithubUrl(project.githubUrl);
          if (!repoDetails) {
            continue;
          }

          try {
            const githubResponse = await fetch(`https://api.github.com/repos/${repoDetails.owner}/${repoDetails.repo}`);

            if (!githubResponse.ok) {
              continue;
            }

            const githubData = await githubResponse.json();
            stats[project._id] = {
              stars: githubData.stargazers_count ?? 0,
              forks: githubData.forks_count ?? 0
            };
          } catch {
            continue;
          }
        }

        if (!isActive) {
          return;
        }

        setGithubStats(stats);
        writeProjectsPageCache(fetchedProjects, stats);
      } catch (err) {
        if (isActive) {
          const message = err instanceof Error ? err.message : "Failed to fetch projects";
          setError(message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProjectsAndStats();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <DynamicPageBackground />
      <PageSeo
        title="Projects | Pamod Madubashana"
        description="Browse full-stack projects by Pamod Madubashana, including production-ready web applications, experiments, and open-source engineering work."
        path="/projects"
        keywords={["Pamod projects", "full-stack portfolio", "web applications", "open-source projects"]}
        structuredData={{
          "@type": "CollectionPage",
          "@id": "https://pamod.is-a.dev/projects#collection",
          url: "https://pamod.is-a.dev/projects",
          name: "Projects | Pamod Madubashana",
          description: "Portfolio collection of full-stack software projects.",
        }}
      />
      <main className="route-transition-content relative z-10 flex-1 pt-24 pb-20">
        {!heroRemoved && (
          <motion.section
            className="section-shell"
            initial={false}
            animate={
              heroExiting
                ? { height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0 }
                : { opacity: 1 }
            }
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => {
              if (heroExiting) setHeroRemoved(true);
            }}
          >
            <div className="section-inner">
              <motion.div
                initial={false}
                animate={heroExiting ? { opacity: 0, y: -48 } : { opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="page-hero-panel mx-auto max-w-4xl"
              >
                <span className="section-pill">PROJECTS ARCHIVE</span>
                <h1 className="section-title text-4xl md:text-5xl lg:text-6xl">
                  <span className="text-foreground/80">Builds, Bots,</span> <span className="text-gradient">Systems</span>
                </h1>
                <p className="section-copy mx-auto mt-5 max-w-2xl">
                  A curated archive of products, automation systems, and experiments powered by the existing project API.
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}

        <section className="section-shell py-10">
          <div className="section-inner">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="surface-card rounded-3xl"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search project"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-background/55 pl-10 pr-4 font-mono text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-shell py-10">
          <div className="section-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={index}
                    githubStats={githubStats[project._id]}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {(loading || error || (filteredProjects.length === 0 && projects.length > 0)) && (
              <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 py-20 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <p className="mt-4 text-muted-foreground">Loading projects...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 py-20 text-center">
                    <p className="text-destructive">Error: {error}</p>
                  </motion.div>
                ) : filteredProjects.length === 0 && projects.length > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 py-20 text-center">
                    <p className="text-muted-foreground">No projects found matching your criteria.</p>
                  </motion.div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Projects;
