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
import DynamicPageBackground from "@/components/DynamicPageBackground";
import PageSeo from "@/components/seo/PageSeo";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface ProjectDetailCachePayload {
  timestamp: number;
  project: Project;
  githubStats: RepoStats | null;
}

interface ReadmeCachePayload {
  timestamp: number;
  content: string | null;
}

const readmeCache = new Map<string, string | null>();

const PROJECT_DETAIL_CACHE_TTL = 15 * 60 * 1000;
const README_CACHE_TTL = 6 * 60 * 60 * 1000;
const MONGODB_OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const getProjectDetailCacheKey = (slug: string) => `project:detail:${slug}`;
const getReadmeCacheKey = (repoKey: string) => `project:readme:${repoKey}`;
const isMongoObjectId = (value: string) => MONGODB_OBJECT_ID_REGEX.test(value);

const readProjectDetailCache = (slug: string): ProjectDetailCachePayload | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const key = getProjectDetailCacheKey(slug);
  const rawCache = window.localStorage.getItem(key);
  if (!rawCache) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawCache) as ProjectDetailCachePayload;
    if (typeof parsed.timestamp !== "number" || !parsed.project || typeof parsed.project !== "object") {
      window.localStorage.removeItem(key);
      return null;
    }

    if (Date.now() - parsed.timestamp > PROJECT_DETAIL_CACHE_TTL) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

const writeProjectDetailCache = (slug: string, project: Project, githubStats: RepoStats | null) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: ProjectDetailCachePayload = {
    timestamp: Date.now(),
    project,
    githubStats
  };

  window.localStorage.setItem(getProjectDetailCacheKey(slug), JSON.stringify(payload));
};

const readPersistedReadme = (repoKey: string): string | null | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const key = getReadmeCacheKey(repoKey);
  const rawCache = window.localStorage.getItem(key);
  if (!rawCache) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawCache) as ReadmeCachePayload;
    if (typeof parsed.timestamp !== "number" || !(typeof parsed.content === "string" || parsed.content === null)) {
      window.localStorage.removeItem(key);
      return undefined;
    }

    if (Date.now() - parsed.timestamp > README_CACHE_TTL) {
      window.localStorage.removeItem(key);
      return undefined;
    }

    return parsed.content;
  } catch {
    window.localStorage.removeItem(key);
    return undefined;
  }
};

const writePersistedReadme = (repoKey: string, content: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: ReadmeCachePayload = {
    timestamp: Date.now(),
    content
  };

  window.localStorage.setItem(getReadmeCacheKey(repoKey), JSON.stringify(payload));
};

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

const truncateMetaDescription = (value: string, maxLength = 158) => {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
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
  disableAnimation?: boolean;
}

const ProjectSection = ({ title, children, index, action, disableAnimation = false }: ProjectSectionProps) => (
  <motion.section
    initial={disableAnimation ? false : { opacity: 0, y: 16 }}
    animate={disableAnimation ? undefined : { opacity: 1, y: 0 }}
    transition={disableAnimation ? undefined : { duration: 0.35, delay: 0.12 + index * 0.08 }}
    className="surface-card min-w-0 overflow-hidden p-6 md:p-8"
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
    <div className="mb-5 flex flex-wrap items-end gap-3 border-b border-white/10 pb-4">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary/70">
          MODULE_{String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="mt-1 text-lg font-bold text-foreground sm:text-xl md:text-2xl">{title}</h2>
      </div>
      <div className="hidden h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent sm:block" />
      {action ? <div className="w-full sm:w-auto sm:shrink-0">{action}</div> : null}
    </div>
    {children}
  </motion.section>
);

interface ProjectGalleryProps {
  projectTitle: string;
  screenshots: string[];
  disableAnimation?: boolean;
}

const ProjectGallery = ({ projectTitle, screenshots, disableAnimation = false }: ProjectGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeImage = activeIndex !== null ? screenshots[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {screenshots.map((shot, shotIndex) => (
          <motion.button
            key={`${projectTitle}-shot-${shotIndex}`}
            type="button"
            initial={disableAnimation ? false : { opacity: 0, y: 12 }}
            animate={disableAnimation ? undefined : { opacity: 1, y: 0 }}
            transition={disableAnimation ? undefined : { duration: 0.28, delay: shotIndex * 0.06 }}
            whileHover={disableAnimation ? undefined : { scale: 1.02 }}
            className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] text-left shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition-colors duration-300 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            onClick={() => setActiveIndex(shotIndex)}
          >
            <img
              src={shot}
              alt={`${projectTitle} screenshot ${shotIndex + 1}`}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </motion.button>
        ))}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(isOpen) => !isOpen && setActiveIndex(null)}>
        <DialogContent className="dark w-[95vw] max-w-5xl border border-primary/20 bg-background/85 p-3 shadow-[0_0_80px_hsl(var(--primary)/0.18)] backdrop-blur-2xl sm:p-4">
          <DialogTitle className="sr-only">Expanded screenshot</DialogTitle>
          {activeImage && (
            <img
              src={activeImage}
              alt={`${projectTitle} expanded screenshot ${activeIndex + 1}`}
              loading="eager"
              decoding="async"
              sizes="95vw"
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
  disableAnimation?: boolean;
}

const ProjectHero = ({ project, disableAnimation = false }: ProjectHeroProps) => {
  const thumbnailSrc = project.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&h=900&fit=crop";

  return (
    <motion.section
      initial={disableAnimation ? false : { opacity: 0, y: 22 }}
      animate={disableAnimation ? undefined : { opacity: 1, y: 0 }}
      transition={disableAnimation ? undefined : { duration: 0.45 }}
      className="surface-card overflow-hidden p-0"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.16] via-transparent to-secondary/[0.16]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-background/55 md:h-[460px] md:min-h-0">
        <img
          src={thumbnailSrc}
          alt=""
          aria-hidden
          loading="eager"
          decoding="async"
          sizes="100vw"
          className="absolute inset-0 hidden h-full w-full min-h-full min-w-full scale-[1.35] object-cover blur-[32px] opacity-80 md:block"
        />

        <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4 sm:px-6 sm:pt-6 md:px-10 md:pt-10">
          <nav aria-label="Breadcrumb" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-background/45 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-xl sm:gap-2">
            <Link to="/" className="transition-colors hover:text-primary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/projects" className="transition-colors hover:text-primary">Projects</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-primary">{project.slug || project._id}</span>
          </nav>
        </div>

        <div className="relative z-10 flex min-h-[360px] items-center justify-center px-4 pb-28 pt-16 sm:px-6 sm:pb-32 sm:pt-20 md:h-full md:min-h-0 md:px-6 md:pb-0 md:pt-0">
          <img
            src={thumbnailSrc}
            alt={`${project.title} thumbnail`}
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 92vw"
            className="max-h-[190px] max-w-full object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.7)] sm:max-h-[240px] md:max-h-[85%] md:max-w-[92%]"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-6 md:px-10 md:pb-10">
          <div className="inline-flex max-w-full flex-col items-start gap-2">
            <p className="section-pill">
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-4 -inset-y-2 -z-10 rounded-full bg-background/35 blur-xl"
              />
              Project Showcase
            </p>
            <h1 className="relative inline-block max-w-3xl break-words px-1 text-xl font-bold leading-tight text-foreground sm:text-2xl md:text-5xl">
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-5 -inset-y-3 -z-10 rounded-full bg-background/30 blur-2xl"
              />
              {project.title}
            </h1>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

interface ProjectSidebarProps {
  project: Project;
  githubStats: RepoStats | null;
  disableAnimation?: boolean;
}

const ProjectSidebar = ({ project, githubStats, disableAnimation = false }: ProjectSidebarProps) => {
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
      initial={disableAnimation ? false : { opacity: 0, y: 16 }}
      animate={disableAnimation ? undefined : { opacity: 1, y: 0 }}
      transition={disableAnimation ? undefined : { duration: 0.35, delay: 0.22 }}
      className="surface-card overflow-hidden rounded-lg p-6 xl:sticky xl:top-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary/75">Project Links</h3>
          <div className="space-y-2">
            {project.liveUrl && (
              <Button asChild className="h-11 w-full justify-start gap-2 rounded-lg bg-primary text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.26)] hover:bg-primary/90">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline" className="h-11 w-full justify-start gap-2 rounded-lg border-white/15 bg-white/[0.035] text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  Source Code
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5">
          <h3 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary/75">Quick Stats</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              { label: "Stars", value: githubStats?.stars ?? 0, icon: Star },
              { label: "Forks", value: githubStats?.forks ?? 0, icon: GitFork },
              { label: "Created", value: formatDate(project.createdAt), icon: CalendarDays },
              { label: "Updated", value: formatDate(project.updatedAt), icon: Clock3 },
            ].map((stat) => (
              <p key={stat.label} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2">
                <span className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-primary" />
                  {stat.label}
                </span>
                <span className="font-mono text-xs font-bold text-foreground">{stat.value}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5">
          <h3 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary/75">Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={`side-tag-${tag}`} className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-bold text-primary/90">
                {tag}
              </span>
            ))}
            {project.languages.map((language) => (
              <span key={`side-language-${language}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-bold text-foreground/80">
                <span className={`h-2 w-2 rounded-full ${languageColors[language] || "bg-muted"}`} />
                {language}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5">
          <h3 className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary/75">Share</h3>
          <Button type="button" variant="outline" onClick={copyLink} className="h-11 w-full justify-start gap-2 rounded-lg border-white/15 bg-white/[0.035] text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
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
        <div className="surface-card overflow-hidden rounded-lg p-6 md:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
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
            <div className="surface-card overflow-hidden rounded-lg p-6 md:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
              <Skeleton className="mb-5 h-7 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-2 h-4 w-4/6" />
            </div>
            <div className="surface-card overflow-hidden rounded-lg p-6 md:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
              <Skeleton className="mb-5 h-7 w-52" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
          <div className="surface-card overflow-hidden rounded-lg p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
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
  const isMobile = useIsMobile();
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

      const cachedProjectDetails = readProjectDetailCache(slug);
      if (cachedProjectDetails) {
        setProject(cachedProjectDetails.project);
        setGithubStats(cachedProjectDetails.githubStats);
        setLoading(false);
        return;
      }

      setProject(null);
      setGithubStats(null);

      try {
        let fetchedProject: Project | null = null;

        try {
          fetchedProject = await projectApi.getProjectBySlug(slug);
        } catch {
          if (!isMongoObjectId(slug)) {
            throw new Error("Project not found");
          }

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

        let resolvedGithubStats: RepoStats | null = null;

        if (fetchedProject.githubUrl) {
          try {
            const repoDetails = extractRepoFromUrl(fetchedProject.githubUrl);

            if (repoDetails) {
              const response = await fetch(`https://api.github.com/repos/${repoDetails.owner}/${repoDetails.repo}`);

              if (response.ok && isActive) {
                const data = await response.json();
                resolvedGithubStats = {
                  stars: data.stargazers_count ?? 0,
                  forks: data.forks_count ?? 0
                };
              }
            }
          } catch {
            resolvedGithubStats = null;
          }
        }

        if (isActive) {
          setGithubStats(resolvedGithubStats);
          writeProjectDetailCache(slug, fetchedProject, resolvedGithubStats);
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

      const persistedReadme = readPersistedReadme(repoKey);
      if (persistedReadme !== undefined) {
        readmeCache.set(repoKey, persistedReadme);
        setReadme(persistedReadme);
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
          writePersistedReadme(repoKey, parsedReadme);
          setReadme(parsedReadme);
        } else {
          readmeCache.set(repoKey, null);
          writePersistedReadme(repoKey, null);
          setReadme(null);
        }
      } catch {
        if (isActive) {
          readmeCache.set(repoKey, null);
          writePersistedReadme(repoKey, null);
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
  const detailPath = slug ? `/projects/${slug}` : "/projects";
  const seoTitle = project
    ? `${project.title} | Pamod Madubashana`
    : "Project Details | Pamod Madubashana";
  const seoDescription = project
    ? truncateMetaDescription(project.description)
    : "Explore implementation details, architecture decisions, and technical highlights from this project by Pamod Madubashana.";
  const projectStructuredData = project
    ? {
        "@type": "SoftwareSourceCode",
        "@id": `https://pamod.is-a.dev${detailPath}#software`,
        name: project.title,
        description: seoDescription,
        url: `https://pamod.is-a.dev${detailPath}`,
        codeRepository: project.githubUrl,
        programmingLanguage: project.languages.join(", "),
        keywords: project.tags.join(", "),
        inLanguage: "en",
        dateCreated: project.createdAt,
        dateModified: project.updatedAt,
        author: {
          "@type": "Person",
          name: "Pamod Madubashana",
          url: "https://pamod.is-a.dev/",
        },
      }
    : undefined;

  return (
    <div className="relative min-h-screen bg-background">
      <DynamicPageBackground />
      <PageSeo
        title={seoTitle}
        description={seoDescription}
        path={detailPath}
        ogType="article"
        ogImage={project?.thumbnail || "/og.png"}
        noIndex={!loading && (!!error || !project)}
        publishedTime={project?.createdAt}
        modifiedTime={project?.updatedAt}
        keywords={project ? [project.title, ...project.tags] : ["project details", "full-stack project"]}
        structuredData={projectStructuredData}
      />
      <Navbar />
      <main className="route-transition-content relative z-10 pt-24 pb-20">
        <h1 className="sr-only">{project?.title ? `${project.title} Project Details` : "Project Details"}</h1>
        {loading ? (
          <ProjectDetailSkeleton />
        ) : error || !project ? (
          <section className="py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={isMobile ? undefined : { opacity: 1, y: 0 }}
                className="surface-card mx-auto max-w-2xl overflow-hidden rounded-lg p-10 text-center"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                <span className="section-pill">Route Error</span>
                <h1 className="mb-4 mt-4 text-3xl font-bold text-foreground md:text-4xl">Project not found</h1>
                <p className="mb-8 text-muted-foreground">
                  We couldn&apos;t find the project you requested. It may have been removed or the slug is invalid.
                </p>
                <Button asChild className="rounded-lg bg-primary text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.26)] hover:bg-primary/90">
                  <Link to="/projects">Back to Projects</Link>
                </Button>
              </motion.div>
            </div>
          </section>
        ) : (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <article className="mx-auto max-w-6xl space-y-8">
                <ProjectHero project={project} disableAnimation={isMobile} />

                <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                  <div className="min-w-0 space-y-8">
                    <ProjectSection title="Overview" index={0} disableAnimation={isMobile}>
                      <p className="whitespace-pre-line break-words text-base leading-relaxed text-muted-foreground">{project.description}</p>
                    </ProjectSection>

                    <ProjectSection
                      title="README"
                      index={1}
                      disableAnimation={isMobile}
                      action={project.githubUrl ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 rounded-lg border-white/15 bg-white/[0.035] text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary sm:w-auto"
                        >
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                            View on GitHub
                          </a>
                        </Button>
                      ) : undefined}
                    >
                      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-background/55 p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.18)] md:p-6">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
                        {readmeLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-28 w-full" />
                          </div>
                        ) : readme ? (
                          <div className="max-w-none text-sm text-muted-foreground md:text-base [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:border-b [&_h1]:border-primary/25 [&_h1]:pb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-primary/20 [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_p]:my-4 [&_p]:break-words [&_p]:leading-relaxed [&_a]:break-all [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:break-words [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:bg-primary/5 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_hr]:my-6 [&_hr]:border-primary/20 [&_table]:my-5 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:rounded-lg [&_table]:border [&_table]:border-white/10 [&_table]:whitespace-nowrap [&_th]:bg-primary/10 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-foreground [&_td]:border-t [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_pre]:my-5 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-primary/20 [&_pre]:bg-black/45 [&_pre]:p-4 [&_pre]:text-[13px] [&_code]:break-words [&_code]:rounded [&_code]:bg-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_pre_code]:bg-transparent [&_pre_code]:p-0">
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
                      <ProjectSidebar project={project} githubStats={githubStats} disableAnimation={isMobile} />
                    </div>

                    {screenshots.length > 0 && (
                      <ProjectSection title="Screenshot Gallery" index={2} disableAnimation={isMobile}>
                        <ProjectGallery projectTitle={project.title} screenshots={screenshots} disableAnimation={isMobile} />
                      </ProjectSection>
                    )}

                  </div>

                  <div className="hidden xl:block">
                    <ProjectSidebar project={project} githubStats={githubStats} disableAnimation={isMobile} />
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default ProjectDetail;
