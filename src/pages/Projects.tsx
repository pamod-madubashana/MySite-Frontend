import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Star, GitFork, ExternalLink, Github, Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

const languageColors: Record<string, string> = {
  React: "bg-cyan-500",
  "Node.js": "bg-green-500",
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-yellow-600",
  MongoDB: "bg-green-600",
  PostgreSQL: "bg-blue-700",
  "Next.js": "bg-black",
  "Tailwind CSS": "bg-teal-500",
};

const languages = ["All", "React", "Node.js", "TypeScript", "JavaScript", "Python", "MongoDB", "PostgreSQL", "Next.js", "Tailwind CSS"];

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  status: 'draft' | 'published';
  thumbnail?: string;
  screenshots?: string[];
  createdAt: string;
  updatedAt: string;
}

const Projects = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { settings, loading: settingsLoading } = useSettings();
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        if (response.ok) {
          setProjects(data.projects || []);
        } else {
          setError(data.error || 'Failed to fetch projects');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesLanguage = selectedLanguage === "All" || project.techStack.includes(selectedLanguage);
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLanguage && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
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
                Featured <span className="text-gradient">Projects</span>
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
              <div className="relative w-full md:w-auto md:flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>

              {/* Language Filter */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                      selectedLanguage === lang
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {lang}
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
                  <motion.article
                    key={project._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group rounded-xl overflow-hidden glass hover-lift"
                  >
                    {/* Content - using a placeholder image for now */}
                    <div className="relative aspect-video overflow-hidden bg-muted/20 flex items-center justify-center">
                      <Github className="w-16 h-16 text-muted-foreground/30" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
                        {project.githubUrl && (
                          <Button size="sm" variant="outline" className="gap-1" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button size="sm" variant="outline" className="gap-1" asChild>
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                              Live
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-3 h-3 rounded-full ${languageColors[project.techStack[0]] || "bg-muted"}`} />
                        <span className="text-xs font-mono text-muted-foreground">
                          {project.techStack[0] || 'Technology'}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.slice(0, 3).map((tech: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs font-mono bg-muted/50 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      {project.featured && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.article>
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
