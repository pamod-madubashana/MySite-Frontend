import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projectApi } from "@/api/projectApi";
import PageSeo from "@/components/seo/PageSeo";

const languages = [
  "All",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Express",
  "MongoDB",
  "MySQL",
  "Docker",
  "AWS",
  "PostgreSQL",
  "Java",
  "Go",
  "Dart",
  "PHP"
];

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
  status: 'draft' | 'published';
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
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubStats, setGithubStats] = useState<GithubStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { settings, loading: settingsLoading } = useSettings();
  
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

  // Get unique tags from all projects for dynamic filtering
  const availableTags = ["All", ...new Set(projects.flatMap(project => project.tags))];

  const filteredProjects = projects.filter((project) => {
    const matchesLanguage = selectedLanguage === "All" || project.tags.includes(selectedLanguage);
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLanguage && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Projects | Pamod Madubashana"
        description="Browse software projects built by Pamod Madubashana, including full-stack applications, experiments, and open-source work."
        path="/projects"
      />
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-1 text-sm font-medium text-secondary bg-secondary/10 rounded-full mb-6">
                My Work
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-foreground/70">Featured </span><span className="text-gradient">Projects</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A collection of projects I've built over the years. From full-stack applications 
                to open-source tools, each represents a unique challenge and learning experience.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl glass"
            >
              {/* Search */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>

              {/* Dynamic Tag Filter - Responsive hiding */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />
                {availableTags.slice(0, 8).map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedLanguage(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                      selectedLanguage === tag
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    } ${
                      // Show more filters on mobile since they're in column layout
                      index >= 6 ? "hidden sm:inline-block" : // Hide 7th+ on very small screens
                      index >= 4 ? "hidden md:inline-block" : "" // Hide 5th-6th on mobile
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLanguage + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-3 text-center py-20"
                  >
                    <div className="flex justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <p className="text-muted-foreground mt-4">Loading projects...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-3 text-center py-20"
                  >
                    <p className="text-destructive">Error: {error}</p>
                  </motion.div>
                ) : filteredProjects.length === 0 && projects.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-3 text-center py-20"
                  >
                    <p className="text-muted-foreground">No projects found matching your criteria.</p>
                  </motion.div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Projects;
