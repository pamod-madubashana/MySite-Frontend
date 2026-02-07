import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  GitFork,
  Github,
  Share2,
  Star
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

interface GithubReadmeResponse {
  content: string;
  encoding: string;
}

const readmeCache = new Map<string, string | null>();

const formatDate = (dateValue: string) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const stripReadmeImagesAndSections = (markdown: string) => {
  const lines = markdown.split("\n");
  const cleanedLines: string[] = [];
  let hideSection = false;
  let hideSectionLevel = 0;

  for (const rawLine of lines) {
    const headingMatch = rawLine.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      const headingLevel = headingMatch[1].length;
      const headingText = headingMatch[2].trim().toLowerCase();

      if (hideSection && headingLevel <= hideSectionLevel) {
        hideSection = false;
      }

      if (!hideSection && /^(screenshots?|images?)\b/.test(headingText)) {
        hideSection = true;
        hideSectionLevel = headingLevel;
        continue;
      }
    }

    if (hideSection) {
      continue;
    }

    const withoutMarkdownImages = rawLine.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
    const withoutHtmlImages = withoutMarkdownImages.replace(/<img[^>]*>/gi, "");
    const withoutDivOpen = withoutHtmlImages.replace(/<div\b[^>]*>/gi, "");
    const withoutDivTags = withoutDivOpen.replace(/<\/div>/gi, "");
    cleanedLines.push(withoutDivTags);
  }

  const cleanedMarkdown = cleanedLines.join("\n").replace(/\n{3,}/g, "\n\n");

  return cleanedMarkdown
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n")
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<\/ul>|<\/ol>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const decodeBase64Utf8 = (base64Content: string) => {
  const normalized = base64Content.replace(/\n/g, "");
  const binaryString = window.atob(normalized);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));

  return new TextDecoder("utf-8").decode(bytes);
};

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

interface ProjectSectionProps {
  title: string;
  children: ReactNode;
  index: number;
  action?: ReactNode;
}

const ProjectSection = ({ title, children, index, action }: ProjectSectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.12 + index * 0.08 }}
    className="glass rounded-2xl p-6 md:p-8"
  >
    <div className="mb-5 flex items-center gap-4 border-b border-border/60 pb-4">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground/90">{title}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
      {action}
    </div>
    {children}
  </motion.section>
);

interface ProjectGalleryProps {
  projectTitle: string;
  screenshots: string[];
}

const ProjectGallery = ({ projectTitle, screenshots }: ProjectGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeImage = activeIndex !== null ? screenshots[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {screenshots.map((shot, shotIndex) => (
          <motion.button
            key={`${projectTitle}-shot-${shotIndex}`}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: shotIndex * 0.06 }}
            whileHover={{ scale: 1.02 }}
            className="group overflow-hidden rounded-xl border border-border/60 bg-card/40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            onClick={() => setActiveIndex(shotIndex)}
          >
            <img
              src={shot}
              alt={`${projectTitle} screenshot ${shotIndex + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </motion.button>
        ))}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(isOpen) => !isOpen && setActiveIndex(null)}>
        <DialogContent className="w-[95vw] max-w-5xl border-border/60 bg-card/90 p-3 backdrop-blur-2xl sm:p-4">
          <DialogTitle className="sr-only">Expanded screenshot</DialogTitle>
          {activeImage && (
            <img
              src={activeImage}
              alt={`${projectTitle} expanded screenshot ${activeIndex + 1}`}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ProjectHeroProps {
  project: Project;
}

const ProjectHero = ({ project }: ProjectHeroProps) => (
  <motion.section
    initial={{ opacity: 0, y: 22 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-6 md:p-10"
  >
    <div className="pointer-events-none absolute inset-0">
      <img
        src={project.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop"}
        alt=""
        aria-hidden
        className="h-full w-full object-cover opacity-20 blur-xl"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/75 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/10" />
    </div>

    <div className="relative space-y-7">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-foreground/80">{project.title}</span>
      </nav>

      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/20">
        <img
          src={project.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop"}
          alt={`${project.title} thumbnail`}
          className="aspect-[16/8] w-full object-cover md:aspect-[16/7]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/45 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
          <div className="max-w-3xl rounded-lg border border-border/50 bg-background/30 p-4 backdrop-blur-md md:p-5">
            <p className="text-sm font-medium tracking-[0.18em] uppercase text-gradient">Project Showcase</p>
            <h1 className="my-3 text-3xl md:text-5xl font-bold leading-tight text-foreground/95">{project.title}</h1>
          </div>
        </div>
      </div>
    </div>
  </motion.section>
);

interface ProjectSidebarProps {
  project: Project;
  githubStats: RepoStats | null;
}

const ProjectSidebar = ({ project, githubStats }: ProjectSidebarProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.22 }}
      className="glass rounded-2xl p-6 xl:sticky xl:top-28"
    >
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Project Links</h3>
          <div className="space-y-2">
            {project.liveUrl && (
              <Button asChild className="w-full justify-start gap-2">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2 border-border/60 bg-card/60 text-foreground hover:bg-card/80 hover:text-foreground">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  Source Code
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="border-t border-border/60 pt-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick Stats</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><Star className="h-4 w-4" />Stars</span><span>{githubStats?.stars ?? 0}</span></p>
            <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><GitFork className="h-4 w-4" />Forks</span><span>{githubStats?.forks ?? 0}</span></p>
            <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Created</span><span>{formatDate(project.createdAt)}</span></p>
            <p className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />Updated</span><span>{formatDate(project.updatedAt)}</span></p>
          </div>
        </div>

        <div className="border-t border-border/60 pt-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={`side-tag-${tag}`} className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-xs text-foreground/75">
                {tag}
              </span>
            ))}
            {project.languages.map((language) => (
              <span key={`side-language-${language}`} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-xs text-foreground/75">
                <span className={`h-2 w-2 rounded-full ${languageColors[language] || "bg-muted"}`} />
                {language}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 pt-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Share</h3>
          <Button type="button" variant="outline" onClick={copyLink} className="w-full justify-start gap-2 border-border/60 bg-card/60 text-foreground hover:bg-card/80 hover:text-foreground">
            <Share2 className="h-4 w-4" />
            {copied ? "Link copied" : "Copy project link"}
            <Copy className="ml-auto h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};

const ProjectDetailSkeleton = () => (
  <section className="py-8 md:py-12">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="glass rounded-2xl p-6 md:p-10">
          <Skeleton className="mb-6 h-4 w-56" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-8">
            <div className="glass rounded-2xl p-6 md:p-8">
              <Skeleton className="mb-5 h-7 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-2 h-4 w-4/6" />
            </div>
            <div className="glass rounded-2xl p-6 md:p-8">
              <Skeleton className="mb-5 h-7 w-52" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-3 h-10 w-full" />
            <Skeleton className="mt-2 h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [githubStats, setGithubStats] = useState<RepoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);

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

  useEffect(() => {
    let isActive = true;

    const fetchReadme = async () => {
      if (!project) {
        setReadme(null);
        setReadmeLoading(false);
        return;
      }

      if (!project.githubUrl) {
        setReadme(null);
        setReadmeLoading(false);
        return;
      }

      const repoDetails = extractRepoFromUrl(project.githubUrl);

      if (!repoDetails) {
        setReadme(null);
        setReadmeLoading(false);
        return;
      }

      const repoKey = `${repoDetails.owner}/${repoDetails.repo}`.toLowerCase();
      if (readmeCache.has(repoKey)) {
        const cachedReadme = readmeCache.get(repoKey) ?? null;
        setReadme(cachedReadme);
        setReadmeLoading(false);
        return;
      }

      setReadme(null);
      setReadmeLoading(true);

      try {
        const response = await fetch(`https://api.github.com/repos/${repoDetails.owner}/${repoDetails.repo}/readme`, {
          headers: {
            Accept: "application/vnd.github+json"
          }
        });

        if (!response.ok) {
          throw new Error("README request failed");
        }

        const data = (await response.json()) as GithubReadmeResponse;
        const parsedReadme = data.encoding === "base64" && data.content
          ? stripReadmeImagesAndSections(decodeBase64Utf8(data.content)).trim()
          : "";

        if (!isActive) {
          return;
        }

        if (parsedReadme) {
          readmeCache.set(repoKey, parsedReadme);
          setReadme(parsedReadme);
        } else {
          readmeCache.set(repoKey, null);
          setReadme(null);
        }
      } catch {
        if (isActive) {
          readmeCache.set(repoKey, null);
          setReadme(null);
        }
      } finally {
        if (isActive) {
          setReadmeLoading(false);
        }
      }
    };

    fetchReadme();

    return () => {
      isActive = false;
    };
  }, [project]);

  const screenshots = project?.screenshots ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {loading ? (
          <ProjectDetailSkeleton />
        ) : error || !project ? (
          <section className="py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-2xl rounded-xl p-10 text-center glass"
              >
                <h1 className="mb-4 text-3xl font-bold text-foreground/80 md:text-4xl">Project not found</h1>
                <p className="mb-8 text-muted-foreground">
                  We couldn&apos;t find the project you requested. It may have been removed or the slug is invalid.
                </p>
                <Button asChild className="hover-lift">
                  <Link to="/projects">Back to Projects</Link>
                </Button>
              </motion.div>
            </div>
          </section>
        ) : (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <article className="mx-auto max-w-6xl space-y-8">
                <ProjectHero project={project} />

                <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                  <div className="space-y-8">
                    <ProjectSection title="Overview" index={0}>
                      <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">{project.description}</p>
                    </ProjectSection>

                    <ProjectSection
                      title="README"
                      index={1}
                      action={project.githubUrl ? (
                        <Button asChild variant="outline" size="sm" className="gap-2 border-border/60 bg-background/50">
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                            View on GitHub
                          </a>
                        </Button>
                      ) : undefined}
                    >
                      <div className="rounded-xl border border-border/60 bg-background/30 p-4 md:p-6">
                        {readmeLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-28 w-full" />
                          </div>
                        ) : readme ? (
                          <div className="max-w-none text-sm text-muted-foreground md:text-base [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:border-b [&_h1]:border-border/60 [&_h1]:pb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-border/40 [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:my-4 [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_hr]:my-6 [&_hr]:border-border/60 [&_table]:my-5 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border/60 [&_th]:bg-muted/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-foreground [&_td]:border-t [&_td]:border-border/50 [&_td]:px-3 [&_td]:py-2 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border/60 [&_pre]:bg-black/40 [&_pre]:p-4 [&_pre]:text-[13px] [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {readme}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">README not available.</p>
                        )}
                      </div>
                    </ProjectSection>

                    <div className="xl:hidden">
                      <ProjectSidebar project={project} githubStats={githubStats} />
                    </div>

                    {screenshots.length > 0 && (
                      <ProjectSection title="Screenshot Gallery" index={2}>
                        <ProjectGallery projectTitle={project.title} screenshots={screenshots} />
                      </ProjectSection>
                    )}

                  </div>

                  <div className="hidden xl:block">
                    <ProjectSidebar project={project} githubStats={githubStats} />
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
