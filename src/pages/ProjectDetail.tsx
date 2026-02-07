import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ExternalLink, GitFork, Github, Loader2, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { projectApi } from "@/api/projectApi";
import { languageColors } from "@/lib/languageColors";

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

interface RepoStats {
  stars: number;
  forks: number;
}

const extractRepoFromUrl = (url: string): { owner: string; repo: string } | null => {
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

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [githubStats, setGithubStats] = useState<RepoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchProject = async () => {
      if (!slug) {
        setError("Project not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setProject(null);
      setGithubStats(null);

      try {
        let fetchedProject: Project | null = null;

        try {
          fetchedProject = await projectApi.getProjectBySlug(slug);
        } catch {
          fetchedProject = await projectApi.getProject(slug);
        }

        if (!isActive) {
          return;
        }

        if (!fetchedProject) {
          setError("Project not found");
          return;
        }

        setProject(fetchedProject);

        if (fetchedProject.githubUrl) {
          try {
            const repoDetails = extractRepoFromUrl(fetchedProject.githubUrl);

            if (repoDetails) {
              const response = await fetch(`https://api.github.com/repos/${repoDetails.owner}/${repoDetails.repo}`);

              if (response.ok && isActive) {
                const data = await response.json();
                setGithubStats({
                  stars: data.stargazers_count ?? 0,
                  forks: data.forks_count ?? 0
                });
              }
            }
          } catch {
            if (isActive) {
              setGithubStats(null);
            }
          }
        }
      } catch {
        if (isActive) {
          setError("Project not found");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProject();

    return () => {
      isActive = false;
    };
  }, [slug]);

  useEffect(() => {
    const defaultTitle = "Projects | Pamod";
    const defaultDescription = "Explore the project portfolio.";

    if (!project) {
      document.title = defaultTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", defaultDescription);
      }
      return;
    }

    document.title = `${project.title} | Projects | Pamod`;
    const metaDescription = project.description.slice(0, 160);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", metaDescription);
    }

    return () => {
      document.title = defaultTitle;
      const resetMeta = document.querySelector('meta[name="description"]');
      if (resetMeta) {
        resetMeta.setAttribute("content", defaultDescription);
      }
    };
  }, [project]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {loading ? (
          <section className="py-32">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading project details...</p>
              </div>
            </div>
          </section>
        ) : error || !project ? (
          <section className="py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center glass rounded-xl p-10"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-foreground/80 mb-4">Project not found</h1>
                <p className="text-muted-foreground mb-8">
                  We couldn&apos;t find the project you requested. It may have been removed or the slug is invalid.
                </p>
                <Button asChild>
                  <Link to="/projects">Back to Projects</Link>
                </Button>
              </motion.div>
            </div>
          </section>
        ) : (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                  <ChevronRight className="h-4 w-4" />
                  <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground/70 truncate">{project.title}</span>
                </nav>

                <div className="relative overflow-hidden rounded-2xl glass">
                  <div className="relative aspect-[16/7] min-h-[260px]">
                    <img
                      src={project.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop"}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                      <h1 className="text-3xl md:text-5xl font-bold text-foreground/80 mb-3">{project.title}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {githubStats?.stars ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="h-4 w-4" />
                          {githubStats?.forks ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 md:p-8 space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-3 text-foreground/80">Overview</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
                  </div>

                  {project.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground/80 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={`tag-${tag}`}
                            className="px-3 py-1 text-xs font-mono rounded-md bg-muted/50 text-foreground/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.languages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground/80 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-4">
                        {project.languages.map((language) => (
                          <div key={`language-${language}`} className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${languageColors[language] || "bg-muted"}`} />
                            <span className="text-sm text-muted-foreground">{language}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(project.liveUrl || project.githubUrl) && (
                    <div className="flex flex-wrap items-center gap-3">
                      {project.liveUrl && (
                        <Button asChild className="gap-2">
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Live
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button asChild variant="outline" className="gap-2">
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                            Code
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {project.screenshots && project.screenshots.length > 0 && (
                  <div className="glass rounded-2xl p-6 md:p-8">
                    <h3 className="text-2xl font-semibold mb-5 text-foreground/80">Screenshots</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.screenshots.map((screenshot, screenshotIndex) => (
                        <motion.div
                          key={`${project._id}-screenshot-${screenshotIndex}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: screenshotIndex * 0.06 }}
                          className="overflow-hidden rounded-xl border border-border/60"
                        >
                          <img
                            src={screenshot}
                            alt={`${project.title} screenshot ${screenshotIndex + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.article>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
