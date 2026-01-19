import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { languageColors } from "@/lib/languageColors";

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    languages: string[];
    githubUrl?: string;
    liveUrl?: string;
    featured: boolean;
    status: 'draft' | 'published';
    thumbnail?: string;
  };
  index: number;
  githubStats?: {
    stars: number;
    forks: number;
  };
  showLanguages?: boolean;
}

export const ProjectCard = ({ 
  project, 
  index, 
  githubStats,
  showLanguages = true 
}: ProjectCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group rounded-xl overflow-hidden glass hover-lift"
    >
      {/* Featured Badge - Top Left */}
      {project.featured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-yellow-500 bg-yellow-800/20 backdrop-blur-sm rounded-full border border-yellow-500/30">
            <Star className="w-3 h-3" />
            Featured
          </span>
        </div>
      )}
      
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.thumbnail || `https://images.unsplash.com/photo-${index + 1}?w=800&h=600&fit=crop`}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
          {project.liveUrl && (
            <Button size="sm" variant="secondary" className="gap-1" asChild>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Live
              </a>
            </Button>
          )}
          {project.githubUrl && (
            <Button size="sm" variant="outline" className="gap-1" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 text-foreground/70" />
                <span className="text-foreground/70">Code</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-foreground/70 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map((tag: string) => (
            <span
              key={`tag-${tag}`}
              className="px-2 py-1 text-xs font-mono bg-muted/50 text-foreground/50 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Languages - Optional */}
        {showLanguages && project.languages && project.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
            {project.languages.slice(0, 3).map((lang: string) => (
              <div key={`lang-${lang}`} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${languageColors[lang] || "bg-muted"}`} />
                <span className="text-xs font-mono text-muted-foreground">
                  {lang}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {githubStats?.stars ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            {githubStats?.forks ?? 0}
          </span>
        </div>
      </div>
    </motion.article>
  );
};