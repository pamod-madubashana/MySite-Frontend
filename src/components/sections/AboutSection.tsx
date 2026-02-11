import { motion } from "framer-motion";
import { Code2, Palette, Zap, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";
import { aboutApi } from "@/api/aboutApi";

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

export const AboutSection = () => {
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
          const allSkills = cachedData.techCategories.flatMap((category: any) =>
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
            const techSkillsData = await skillsResponse.json();
            const mappedTechStack = techSkillsData.map((skill: any) => ({
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

  return (
    <section id="about" className="section-shell">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl animate-orbit-soft" />
      <div aria-hidden className="pointer-events-none absolute -right-28 bottom-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl animate-orbit-soft" />

      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <span className="section-pill">About Me</span>
          <h2 className="section-title">
            <span className="text-foreground/75">Crafting Digital</span> <span className="text-gradient">Experiences</span>
          </h2>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            With over 5 years of experience in full-stack development, I specialize in building scalable web applications that users love.
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface-card group cursor-pointer"
            >
              <div className="relative mb-5 inline-flex">
                <div className={`surface-icon ${skill.iconTone}`}>
                  <skill.icon className="h-6 w-6" />
                </div>
                <motion.span
                  aria-hidden
                  className={`absolute inset-0 rounded-xl border ${skill.ringTone}`}
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface-card mx-auto max-w-3xl"
        >
          <h3 className="text-center text-2xl font-semibold text-foreground/90">Technical Proficiency</h3>

          <div className="mt-8 space-y-5">
            {loading ? (
              <div className="py-6 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : (
              displayedTechStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-sm text-foreground/80">{tech.name}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{tech.level}%</span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-muted/20">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${tech.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                    />
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
