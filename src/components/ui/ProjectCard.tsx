import { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { languageColors } from "@/lib/languageColors";
import { Link, useNavigate } from "react-router-dom";

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
}

const fallbackGradients = [
  "from-primary/45 via-secondary/20 to-accent/35",
  "from-secondary/45 via-primary/20 to-accent/35",
  "from-accent/45 via-primary/20 to-secondary/35"
];

export const ProjectCard = ({
  project,
  index,
  githubStats,
  showLanguages = true
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const projectPath = `/projects/${project.slug || project._id}`;
  const fallbackGradient = fallbackGradients[index % fallbackGradients.length];

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(projectPath);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="surface-card group relative flex h-full cursor-pointer flex-col overflow-hidden p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      onClick={() => navigate(projectPath)}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
    >
      {project.featured && (
        <div className="absolute left-4 top-4 z-20">
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/35 bg-yellow-400/10 px-2.5 py-1 text-xs font-semibold text-yellow-200">
            <Star className="h-3 w-3" />
            Featured
          </span>
        </div>
      )}

      <div className="relative aspect-[16/10] overflow-hidden border-b border-border/60">
        <Link to={projectPath} onClick={(event) => event.stopPropagation()} className="block h-full w-full">
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
            <div className={`h-full w-full bg-gradient-to-br ${fallbackGradient}`} />
          )}
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-background/92 via-background/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

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

      <div className="flex flex-1 flex-col p-6">
        <Link to={projectPath} onClick={(event) => event.stopPropagation()} className="inline-block">
          <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
            {project.title}
          </h3>
        </Link>

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
          <div className="mt-5 flex flex-wrap gap-3 border-t border-border/60 pt-4">
            {project.languages.slice(0, 3).map((lang) => (
              <div key={`lang-${lang}`} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${languageColors[lang] || "bg-muted"}`} />
                <span className="text-xs font-mono text-muted-foreground">{lang}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4 text-sm text-muted-foreground">
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
