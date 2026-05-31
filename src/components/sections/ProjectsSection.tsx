import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectApi } from "@/api/projectApi";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { TransitionLink } from "@/components/TransitionLink";
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

const ProjectsHeader = ({ copy, shouldAnimate }: { copy: string; shouldAnimate: boolean }) => (
  <motion.div
    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
    whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
    viewport={shouldAnimate ? { once: true, amount: 0.2, margin: "0px 0px -64px 0px" } : undefined}
    transition={shouldAnimate ? { duration: 0.42 } : undefined}
    className="mx-auto mb-14 max-w-3xl text-center"
  >
    <span className="section-pill">Featured Work</span>
    <h2 className="section-title">
      <span className="text-foreground/80">Featured</span> <span className="text-gradient">Projects</span>
    </h2>
    <p className="section-copy mx-auto mt-4 max-w-2xl">{copy}</p>
  </motion.div>
);

export const ProjectsSection = () => {
  const isMobile = useIsMobile();
  const shouldAnimate = !isMobile;
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubStats, setGithubStats] = useState<Record<string, { stars: number; forks: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsAndStats = async () => {
      try {
        const response = await projectApi.getProjects({ limit: 3 });
        setProjects(response.projects);

        const stats: Record<string, { stars: number; forks: number }> = {};
        for (const project of response.projects) {
          if (!project.githubUrl) {
            continue;
          }

          try {
            const urlParts = project.githubUrl.replace("https://github.com/", "").split("/");
            if (urlParts.length < 2) {
              continue;
            }

            const owner = urlParts[0];
            const repo = urlParts[1].split("/")[0];
            const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

            if (!githubResponse.ok) {
              continue;
            }

            const data = await githubResponse.json();
            stats[project._id] = {
              stars: data.stargazers_count,
              forks: data.forks_count
            };
          } catch {
            continue;
          }
        }

        setGithubStats(stats);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndStats();
  }, []);

  return (
    <section id="projects" className="section-shell section-shell-muted">
      <div className="section-inner">
        {loading ? (
          <>
            <ProjectsHeader copy="Loading projects..." shouldAnimate={shouldAnimate} />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`project-skeleton-${index}`} className="surface-card animate-pulse">
                  <div className="aspect-[16/10] rounded-xl bg-muted/40" />
                  <div className="mt-6 h-5 w-2/3 rounded bg-muted/40" />
                  <div className="mt-3 h-4 w-full rounded bg-muted/40" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          </>
        ) : projects.length === 0 ? (
          <>
            <ProjectsHeader copy="No recent projects found yet." shouldAnimate={shouldAnimate} />
            <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card/30 p-8 text-center backdrop-blur-xl">
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-4 text-muted-foreground">New case studies are on the way. Check back soon.</p>
            </div>
          </>
        ) : (
          <>
            <ProjectsHeader
              copy="A focused selection of recent builds with polished UX, solid architecture, and measurable impact."
              shouldAnimate={shouldAnimate}
            />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  githubStats={githubStats[project._id]}
                  disableEntryAnimation={!shouldAnimate}
                />
              ))}
            </div>

            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 18 } : false}
              whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
              viewport={shouldAnimate ? { once: true, amount: 0.2, margin: "0px 0px -64px 0px" } : undefined}
              transition={shouldAnimate ? { duration: 0.38, delay: 0.12 } : undefined}
              className="mt-14 text-center"
            >
              <Button asChild variant="outline" size="lg" className="brand-outline-btn group px-8 font-mono text-xs font-bold uppercase tracking-[0.14em]">
                <TransitionLink to="/projects" className="inline-flex min-h-11 items-center">
                  <Code className="mr-2 h-5 w-5" />
                  View Full Archive
                  <motion.span
                    className="ml-2"
                    animate={shouldAnimate ? { x: [0, 5, 0] } : undefined}
                    transition={shouldAnimate ? { duration: 1.1, repeat: Infinity } : undefined}
                  >
                    {"->"}
                  </motion.span>
                </TransitionLink>
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};
