import { motion } from "framer-motion";
import { Code2, Palette, Zap, Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicSiteData } from "@/hooks/usePublicSiteData";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const skills = [
  {
    icon: Code2,
    title: "Frontend Development",
    description: "React, TypeScript, Next.js, Tailwind CSS",
  },
  {
    icon: Zap,
    title: "Backend Development",
    description: "Node.js, Express, PostgreSQL, MongoDB",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Figma, Framer, Motion Design",
  },
  {
    icon: Globe,
    title: "DevOps & Cloud",
    description: "AWS, Docker, CI/CD, Vercel",
  },
];

export const AboutSection = () => {
  const isMobile = useIsMobile();
  const shouldAnimate = !isMobile;
  const { data: siteData, isLoading } = usePublicSiteData();
  const fallbackTechStack = [
    { name: "Python", level: 95 },
    { name: "JavaScript", level: 80 },
    { name: "React", level: 65 },
    { name: "TypeScript", level: 75 },
    { name: "MongoDB", level: 85 },
    { name: "AWS", level: 30 },
  ];
  const techStack = siteData?.techSkills.length
    ? siteData.techSkills.map((skill) => ({
        name: skill.name,
        level: skill.level,
      }))
    : fallbackTechStack;

  const displayedTechStack = techStack.slice(0, 8);
  const revealViewport = { once: true, amount: 0.2, margin: "0px 0px -64px 0px" };

  const fadeUp = (delay = 0) => ({
    initial: shouldAnimate ? { opacity: 0, y: 8 } : false,
    whileInView: shouldAnimate ? { opacity: 1, y: 0 } : undefined,
    viewport: shouldAnimate ? revealViewport : undefined,
    transition: shouldAnimate ? { duration: 0.4, delay, ease: EASE } : undefined,
  });

  return (
    <section id="about" className="section-shell">
      <div className="section-inner">
        <motion.div {...fadeUp()} className="mx-auto mb-12 max-w-3xl text-center">
          <span className="section-pill">About me</span>
          <h2 className="section-title">Web apps, automation, self-hosted systems</h2>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            I connect high-performance backends, practical automation, and sharp interfaces into
            systems that feel fast, useful, and resilient.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.05)}
          className="mx-auto mb-16 max-w-3xl space-y-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          <p>
            My work lives at the intersection of web apps, Telegram automation, backend services,
            and self-hosted infrastructure.
          </p>
          <p>
            I like systems that are independent, observable, and easy to ship: Dockerized services,
            clean APIs, useful dashboards, and UI that makes operations feel calm.
          </p>
          <p>
            AI-assisted development helps me move from idea to production faster while keeping the
            architecture readable and maintainable.
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {skills.map((skill, index) => (
            <motion.div key={skill.title} {...fadeUp(index * 0.05)} className="surface-card">
              <div className="surface-icon mb-5">
                <skill.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-foreground">{skill.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {skill.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp()} className="surface-card mx-auto max-w-5xl">
          <div className="mb-6 border-b border-foreground/10 pb-5">
            <span className="section-pill">Skill matrix</span>
            <h3 className="mt-3 text-2xl font-medium leading-tight text-foreground md:text-3xl">
              Technical proficiency
            </h3>
          </div>

          {isLoading ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/10 border-t-foreground/50" />
              <p className="font-mono text-xs text-muted-foreground">Loading skills</p>
            </div>
          ) : (
            <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
              {displayedTechStack.map((tech, index) => (
                <motion.div key={tech.name} {...fadeUp(index * 0.05)}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-foreground sm:text-base">{tech.name}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {tech.level}%
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                    <motion.div
                      initial={shouldAnimate ? { width: 0 } : false}
                      whileInView={shouldAnimate ? { width: `${tech.level}%` } : undefined}
                      viewport={shouldAnimate ? revealViewport : undefined}
                      transition={
                        shouldAnimate
                          ? { duration: 0.75, delay: 0.16 + index * 0.06, ease: "easeOut" }
                          : undefined
                      }
                      style={!shouldAnimate ? { width: `${tech.level}%` } : undefined}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                    <span>Throughput</span>
                    <span>
                      {tech.level >= 80 ? "High" : tech.level >= 60 ? "Stable" : "Learning"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
