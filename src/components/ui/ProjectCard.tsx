import { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, Github, Code } from "lucide-react";
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

export const ProjectCard = ({
  project,
  index,
  githubStats,
  showLanguages = true,
  disableEntryAnimation = false
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const projectPath = `/projects/${project.slug || project._id}`;

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateWithTransition(navigate, projectPath);
    }
  };

  return (
    <motion.article
      initial={disableEntryAnimation ? false : { opacity: 0, y: 8 }}
      animate={disableEntryAnimation ? undefined : { opacity: 1, y: 0 }}
      transition={
        disableEntryAnimation
          ? undefined
          : { duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }
      }
      className="surface-card group relative flex h-full cursor-pointer flex-col overflow-hidden p-0 transition-[border-color] duration-150 hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={() => navigateWithTransition(navigate, projectPath)}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
    >
      {project.featured && (
        <div className="absolute left-4 top-4 z-20">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
            Featured
          </span>
        </div>
      )}

      <div className="relative aspect-[16/10] overflow-hidden border-b border-foreground/10 bg-background/70">
        <TransitionLink to={projectPath} onClick={(event) => event.stopPropagation()} className="block h-full w-full">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-foreground/10 bg-muted/50 text-muted-foreground">
                <Code className="h-7 w-7" strokeWidth={1.5} />
              </div>
            </div>
          )}
        </TransitionLink>

        <div className="absolute bottom-4 right-4 z-10 flex items-center justify-end gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          {project.liveUrl && (
            <Button
              size="sm"
              variant="secondary"
              className="h-11 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
              asChild
            >
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                <ExternalLink strokeWidth={1.5} />
                Live
              </a>
            </Button>
          )}

          {project.githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="h-11 rounded-lg border-foreground/10 bg-background/80 px-3 text-xs font-medium text-foreground backdrop-blur-xl transition-colors duration-150 hover:border-foreground/25 hover:bg-background"
              asChild
            >
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                <Github strokeWidth={1.5} />
                Code
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col bg-background/35 p-6">
        <TransitionLink to={projectPath} onClick={(event) => event.stopPropagation()} className="inline-block">
          <h3 className="text-xl font-medium text-foreground">
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
        <div className="mt-5 flex flex-wrap gap-3 border-t border-foreground/10 pt-4">
            {project.languages.slice(0, 3).map((lang) => (
              <div key={`lang-${lang}`} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${languageColors[lang] || "bg-muted"}`} />
                <span className="font-mono text-xs text-muted-foreground">{lang}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-foreground/10 pt-4 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4" strokeWidth={1.5} />
            {githubStats?.stars ?? 0}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitFork className="h-4 w-4" strokeWidth={1.5} />
            {githubStats?.forks ?? 0}
          </span>
        </div>
      </div>
    </motion.article>
  );
};
