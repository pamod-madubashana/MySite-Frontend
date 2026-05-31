import { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { languageColors } from "@/lib/languageColors";
import { useNavigate } from "react-router-dom";
import { TransitionLink } from "@/components/TransitionLink";
import { navigateWithTransition } from "@/lib/viewTransition";

interface ProjectCardProps {
  project: {
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
  };
  index: number;
  githubStats?: {
    stars: number;
    forks: number;
  };
  showLanguages?: boolean;
  disableEntryAnimation?: boolean;
}

const fallbackGradients = [
  "from-primary/15 via-background/40 to-secondary/15",
  "from-secondary/15 via-background/40 to-primary/15",
  "from-accent/15 via-background/40 to-primary/15"
];

export const ProjectCard = ({
  project,
  index,
  githubStats,
  showLanguages = true,
  disableEntryAnimation = false
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const projectPath = `/projects/${project.slug || project._id}`;
  const fallbackGradient = fallbackGradients[index % fallbackGradients.length];

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateWithTransition(navigate, projectPath);
    }
  };

  return (
    <motion.article
      initial={disableEntryAnimation ? false : { opacity: 0, y: 28 }}
      animate={disableEntryAnimation ? undefined : { opacity: 1, y: 0 }}
      transition={disableEntryAnimation ? undefined : { duration: 0.45, delay: index * 0.08 }}
      className="surface-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      onClick={() => navigateWithTransition(navigate, projectPath)}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
    >
      {project.featured && (
        <div className="absolute left-4 top-4 z-20">
          <span className="inline-flex items-center gap-1 rounded-md border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
            <Star className="h-3 w-3" />
            Featured
          </span>
        </div>
      )}

      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-muted/30">
        <TransitionLink to={projectPath} onClick={(event) => event.stopPropagation()} className="block h-full w-full">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fallbackGradient}`}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-[0_0_40px_hsl(var(--primary)/0.16)]">
                <Code className="h-9 w-9" />
              </div>
            </div>
          )}
        </TransitionLink>

        <div className="absolute inset-0 bg-gradient-to-t from-background/92 via-background/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />

        <div className="absolute inset-x-0 bottom-4 z-10 flex translate-y-2 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {project.liveUrl && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 border border-primary/20 bg-primary/85 text-primary-foreground hover:bg-primary"
              asChild
            >
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                <ExternalLink className="h-4 w-4" />
                Live
              </a>
            </Button>
          )}

          {project.githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="brand-outline-btn gap-1.5"
              asChild
            >
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                <Github className="h-4 w-4" />
                Code
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-background/35 p-6">
        <TransitionLink to={projectPath} onClick={(event) => event.stopPropagation()} className="inline-block">
          <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
            {project.title}
          </h3>
        </TransitionLink>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={`tag-${tag}`} className="chip-tag">
              {tag}
            </span>
          ))}
        </div>

        {showLanguages && project.languages && project.languages.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4">
            {project.languages.slice(0, 3).map((lang) => (
              <div key={`lang-${lang}`} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${languageColors[lang] || "bg-muted"}`} />
                <span className="text-xs font-mono text-muted-foreground">{lang}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            {githubStats?.stars ?? 0}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitFork className="h-4 w-4" />
            {githubStats?.forks ?? 0}
          </span>
        </div>
      </div>
    </motion.article>
  );
};
