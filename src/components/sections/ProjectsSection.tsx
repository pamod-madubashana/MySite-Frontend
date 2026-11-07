import { motion } from "framer-motion";
import { Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteProject } from "@/api/siteDataApi";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { TransitionLink } from "@/components/TransitionLink";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicSiteData } from "@/hooks/usePublicSiteData";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ProjectsHeader = ({ copy, shouldAnimate }: { copy: string; shouldAnimate: boolean }) => (
  <motion.div
    initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
    whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
    viewport={shouldAnimate ? { once: true, amount: 0.2, margin: "0px 0px -64px 0px" } : undefined}
    transition={shouldAnimate ? { duration: 0.4, ease: EASE } : undefined}
    className="mx-auto mb-14 max-w-3xl text-center"
  >
    <span className="section-pill">Featured work</span>
    <h2 className="section-title">Projects</h2>
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
            <div className="mx-auto max-w-2xl rounded-xl border border-foreground/10 bg-card p-8 text-center">
              <p className="text-muted-foreground">New case studies are on the way. Check back soon.</p>
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
              initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
              whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
              viewport={shouldAnimate ? { once: true, amount: 0.2, margin: "0px 0px -64px 0px" } : undefined}
              transition={shouldAnimate ? { duration: 0.4, delay: 0.12, ease: EASE } : undefined}
              className="mt-14 text-center"
            >
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-lg border-foreground/10 bg-transparent text-sm font-medium text-foreground transition-colors duration-150 hover:border-foreground/25 hover:bg-foreground/[0.04]"
              >
                <TransitionLink to="/projects" className="min-h-11">
                  <Code className="text-muted-foreground" strokeWidth={1.5} />
                  View full archive
                  <span className="font-mono text-muted-foreground">{"->"}</span>
                </TransitionLink>
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};
