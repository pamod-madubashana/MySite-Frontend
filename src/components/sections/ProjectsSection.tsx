import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { projectApi } from "@/api/projectApi";
import { ProjectCard } from "@/components/ui/ProjectCard";

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

const ProjectsHeader = ({ copy }: { copy: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="mx-auto mb-14 max-w-3xl text-center"
  >
    <span className="section-pill">Featured Work</span>
    <h2 className="section-title">
      <span className="text-foreground/75">Recent</span> <span className="text-gradient">Projects</span>
    </h2>
    <p className="section-copy mx-auto mt-4 max-w-2xl">{copy}</p>
  </motion.div>
);

export const ProjectsSection = () => {
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
      <div aria-hidden className="pointer-events-none absolute -right-24 top-12 h-60 w-60 rounded-full bg-secondary/20 blur-3xl animate-orbit-soft" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-1/3 h-48 w-48 rounded-full bg-primary/16 blur-3xl animate-orbit-soft" />

      <div className="section-inner">
        {loading ? (
          <>
            <ProjectsHeader copy="Loading projects..." />
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
            <ProjectsHeader copy="No recent projects found yet." />
            <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card/30 p-8 text-center backdrop-blur-xl">
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-4 text-muted-foreground">New case studies are on the way. Check back soon.</p>
            </div>
          </>
        ) : (
          <>
            <ProjectsHeader copy="A focused selection of recent builds with polished UX, solid architecture, and measurable impact." />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  githubStats={githubStats[project._id]}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="mt-14 text-center"
            >
              <Button asChild variant="outline" size="lg" className="brand-outline-btn group px-8 font-semibold">
                <Link to="/projects">
                  <Code className="mr-2 h-5 w-5" />
                  View All Projects
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  >
                    {"->"}
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};
