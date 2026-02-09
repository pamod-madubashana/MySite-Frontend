import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Filter, Search, Loader2 } from "lucide-react";
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
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubStats, setGithubStats] = useState<GithubStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const availableTags = ["All", ...new Set(projects.flatMap((project) => project.tags))].slice(0, 10);

  const filteredProjects = projects.filter((project) => {
    const matchesTag = selectedTag === "All" || project.tags.includes(selectedTag);
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesTag && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-background">
      <DynamicPageBackground />
      <PageSeo
        title="Projects | Pamod Madubashana"
        description="Browse software projects built by Pamod Madubashana, including full-stack applications, experiments, and open-source work."
        path="/projects"
      />
      <Navbar />
      <main className="relative z-10 pt-24 pb-20">
        <section className="section-shell">
          <div className="section-inner">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="page-hero-panel mx-auto max-w-4xl"
            >
              <span className="section-pill">My Work</span>
              <h1 className="section-title text-4xl md:text-5xl lg:text-6xl">
                <span className="text-foreground/75">Featured</span> <span className="text-gradient">Projects</span>
              </h1>
              <p className="section-copy mx-auto mt-5 max-w-2xl">
                A curated collection of products, experiments, and open-source builds with clean architecture and practical impact.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-shell section-shell-muted py-10">
          <div className="section-inner">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="surface-card flex flex-col gap-5 backdrop-blur-2xl md:flex-row md:items-center md:justify-between"
            >
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border/70 bg-background/55 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  Filter
                </span>

                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      selectedTag === tag
                        ? "border-primary/55 bg-primary/20 text-primary"
                        : "border-border/60 bg-background/35 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-shell py-10">
          <div className="section-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTag + searchQuery}
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
