import { motion } from "framer-motion";
import { Code2, Palette, Zap, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";
import { aboutApi } from "@/api/aboutApi";
import { useIsMobile } from "@/hooks/use-mobile";

const skills = [
  {
    icon: Code2,
    title: "Frontend Development",
    description: "React, TypeScript, Next.js, Tailwind CSS",
    iconTone: "text-primary",
    ringTone: "border-primary/45",
    glowTone: "from-primary/35 via-primary/10 to-transparent"
  },
  {
    icon: Zap,
    title: "Backend Development",
    description: "Node.js, Express, PostgreSQL, MongoDB",
    iconTone: "text-secondary",
    ringTone: "border-secondary/45",
    glowTone: "from-secondary/35 via-secondary/10 to-transparent"
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Figma, Framer, Motion Design",
    iconTone: "text-accent",
    ringTone: "border-accent/45",
    glowTone: "from-accent/35 via-accent/10 to-transparent"
  },
  {
    icon: Globe,
    title: "DevOps & Cloud",
    description: "AWS, Docker, CI/CD, Vercel",
    iconTone: "text-primary",
    ringTone: "border-primary/45",
    glowTone: "from-primary/35 via-primary/10 to-transparent"
  }
];

interface CachedTechCategory {
  skills: string[];
}

interface PublicTechSkill {
  name: string;
  level: number;
}

export const AboutSection = () => {
  const isMobile = useIsMobile();
  const shouldAnimate = !isMobile;

  const [techStack, setTechStack] = useState([
    { name: "Python", level: 95 },
    { name: "JavaScript", level: 80 },
    { name: "React", level: 65 },
    { name: "TypeScript", level: 75 },
    { name: "MongoDB", level: 85 },
    { name: "AWS", level: 30 }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechSkills = async () => {
      try {
        const cachedData = aboutApi.getCachedAboutData();

        if (cachedData && cachedData.techCategories.length > 0) {
          const allSkills = (cachedData.techCategories as CachedTechCategory[]).flatMap((category) =>
            category.skills.map((skill: string) => ({
              name: skill,
              level: Math.floor(Math.random() * 40) + 60
            }))
          );

          if (allSkills.length > 0) {
            setTechStack(allSkills.slice(0, 6));
          }

          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/tech-stack-categories/public`);
        if (response.ok) {
          await response.json();

          const skillsResponse = await fetch(`${API_BASE_URL}/tech-skills/public`);
          if (skillsResponse.ok) {
            const techSkillsData = (await skillsResponse.json()) as PublicTechSkill[];
            const mappedTechStack = techSkillsData.map((skill) => ({
              name: skill.name,
              level: skill.level
            }));

            if (mappedTechStack.length > 0) {
              setTechStack(mappedTechStack);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching tech skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechSkills();
  }, []);

  const displayedTechStack = techStack.slice(0, 8);
  const revealViewport = { once: true, amount: 0.2, margin: "0px 0px -64px 0px" };

  return (
    <section id="about" className="section-shell">
      <div className="section-inner">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 26 } : false}
          whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          viewport={shouldAnimate ? revealViewport : undefined}
          transition={shouldAnimate ? { duration: 0.45 } : undefined}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <span className="section-pill">About Me</span>
          <h2 className="section-title">
            <span className="text-foreground/80">Architecting</span> <span className="text-gradient">Digital Flows</span>
          </h2>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            I connect high-performance backends, practical automation, and sharp interfaces into systems that feel fast, useful, and resilient.
          </p>
        </motion.div>

        <div className="mb-16 grid items-stretch gap-8 md:grid-cols-12">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -24 } : false}
            whileInView={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
            viewport={shouldAnimate ? revealViewport : undefined}
            transition={shouldAnimate ? { duration: 0.45 } : undefined}
            className="surface-card md:col-span-5"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">INITIALIZING SYSTEM</span>
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.85)]" />
            </div>
            <div className="h-full min-h-[280px] overflow-hidden font-mono text-sm leading-7 text-primary/65">
              <div className="code-container space-y-1">
                <p>&gt; ARCHITECTURE: FULL_STACK</p>
                <p>&gt; STATUS: OPTIMAL</p>
                <p>class DigitalArchitect {"{"}</p>
                <p className="pl-4">stack = [&quot;React&quot;, &quot;Node&quot;, &quot;Python&quot;];</p>
                <p className="pl-4">focus = &quot;Practical systems&quot;;</p>
                <p>{"}"}</p>
                <p>&gt; DEPLOYING RECENT PROJECT...</p>
                <p>&gt; CONNECTED TO NODE_01</p>
                <p className="text-secondary/75">while(alive) {"{"} code(); deploy(); {"}"}</p>
                <p>&gt; SECURITY PROTOCOL: ACTIVE</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: 24 } : false}
            whileInView={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
            viewport={shouldAnimate ? revealViewport : undefined}
            transition={shouldAnimate ? { duration: 0.45, delay: 0.08 } : undefined}
            className="surface-card flex flex-col justify-center md:col-span-7"
          >
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
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
            </div>
          </motion.div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={shouldAnimate ? { opacity: 0, y: 22 } : false}
              whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
              viewport={shouldAnimate ? revealViewport : undefined}
              transition={shouldAnimate ? { duration: 0.38, delay: index * 0.06 } : undefined}
              className="surface-card group cursor-pointer"
            >
              <div className="relative mb-5 inline-flex">
                <div className={`surface-icon ${skill.iconTone}`}>
                  <skill.icon className="h-6 w-6" />
                </div>
                <motion.span
                  aria-hidden
                  className={`absolute inset-0 rounded-xl border ${skill.ringTone}`}
                  animate={shouldAnimate ? { rotate: [0, 6, -6, 0] } : undefined}
                  transition={shouldAnimate ? { duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 } : undefined}
                />
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-r ${skill.glowTone} opacity-70 blur-xl`}
                />
              </div>

              <h3 className="text-lg font-semibold text-foreground">{skill.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{skill.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
          whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          viewport={shouldAnimate ? revealViewport : undefined}
          transition={shouldAnimate ? { duration: 0.45 } : undefined}
          className="surface-card mx-auto max-w-5xl overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="section-pill">Skill Matrix</span>
              <h3 className="mt-3 text-2xl font-black leading-tight text-foreground md:text-3xl">
                Technical <span className="text-gradient">Proficiency</span>
              </h3>
            </div>
            <div className="inline-flex items-center gap-3 self-start rounded-full border border-primary/25 bg-primary/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
              Core Synced
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="col-span-full flex min-h-40 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full border border-primary/25 bg-primary/10 shadow-[0_0_44px_hsl(var(--primary)/0.18)]">
                    <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-r-primary/50 border-t-primary" />
                    <div className="absolute -inset-1 animate-[spin_1.6s_linear_infinite_reverse] rounded-full border border-transparent border-t-secondary/60" />
                  </div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Scanning Skill Nodes
                  </p>
                </div>
              </div>
            ) : (
              displayedTechStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
                  whileInView={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
                  viewport={shouldAnimate ? revealViewport : undefined}
                  transition={shouldAnimate ? { duration: 0.35, delay: index * 0.06 } : undefined}
                  className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition-colors duration-300 hover:border-primary/35 hover:bg-primary/[0.06]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">
                        NODE_{String(index + 1).padStart(2, "0")}
                      </p>
                      <h4 className="mt-1 text-base font-black text-foreground">{tech.name}</h4>
                    </div>
                    <span className="rounded-md border border-primary/20 bg-background/55 px-2.5 py-1 font-mono text-xs font-black text-primary">
                      {tech.level}%
                    </span>
                  </div>

                  <div className="relative h-2 overflow-hidden rounded-full bg-background/70 ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,rgba(255,255,255,0.08)_50%,transparent_100%)] bg-[length:24px_100%] opacity-35" />
                    <motion.div
                      initial={shouldAnimate ? { width: 0 } : false}
                      whileInView={shouldAnimate ? { width: `${tech.level}%` } : undefined}
                      viewport={shouldAnimate ? revealViewport : undefined}
                      transition={shouldAnimate ? { duration: 0.75, delay: 0.16 + index * 0.06, ease: "easeOut" } : undefined}
                      style={!shouldAnimate ? { width: `${tech.level}%` } : undefined}
                      className="relative h-full rounded-full bg-gradient-to-r from-primary via-cyan-300 to-secondary shadow-[0_0_22px_hsl(var(--primary)/0.45)]"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <span>Throughput</span>
                    <span>{tech.level >= 80 ? "High" : tech.level >= 60 ? "Stable" : "Learning"}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
