import { motion } from "framer-motion";
import { Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteProject } from "@/api/siteDataApi";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { TransitionLink } from "@/components/TransitionLink";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicSiteData } from "@/hooks/usePublicSiteData";

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
  const { data: siteData, isLoading } = usePublicSiteData();
  const sourceProjects = siteData?.featuredProjects.length ? siteData.featuredProjects : siteData?.projects || [];
  const projects: SiteProject[] = sourceProjects.slice(0, 3);
  const githubStats = siteData?.github.projectStats || {};

  return (
    <section id="projects" className="section-shell section-shell-muted">
      <div className="section-inner">
        {isLoading ? (
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
