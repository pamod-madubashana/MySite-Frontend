import { motion } from "framer-motion";
import type { ComponentType } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Briefcase, GraduationCap, Award, Code2, 
  Database, Cloud, Palette, Terminal, 
  Heart, Coffee, Music, Mountain 
} from "lucide-react";
import { useState, useEffect } from 'react';
import type { SiteInterest, SiteTimelineItem } from '@/api/siteDataApi';
import { usePublicSiteData } from "@/hooks/usePublicSiteData";
import PageSeo from "@/components/seo/PageSeo";
import DynamicPageBackground from "@/components/DynamicPageBackground";

// Icon mapping for dynamic icon rendering
const iconMap = {
  Briefcase,
  Cloud,
  Terminal,
  Palette,
  Database,
  GraduationCap,
  Award,
  Code2,
  Heart,
  Coffee,
  Music,
  Mountain,
};

type IconComponent = ComponentType<{ className?: string }>;

interface TimelineDisplayItem {
  _id?: string;
  year: string;
  role: string;
  company?: string;
  description: string;
  icon: IconComponent;
}

interface TechCategoryResponse {
  title: string;
  icon: string;
  skills: string[];
}

interface TechCategoryDisplay {
  title: string;
  icon: IconComponent;
  skills: string[];
}

interface InterestDisplayItem {
  _id?: string;
  icon: IconComponent;
  label: string;
}

const resolveIcon = (icon: string | undefined, fallback: IconComponent = Briefcase): IconComponent =>
  iconMap[icon as keyof typeof iconMap] || fallback;

const About = () => {
  const { data: siteData, isLoading, error } = usePublicSiteData();
  const [timeline, setTimeline] = useState<TimelineDisplayItem[]>([]);
  const [techCategories, setTechCategories] = useState<TechCategoryDisplay[]>([
    {
      title: "Frontend",
      icon: Palette,
      skills: ["React", "JavaScript", "Tailwind CSS", "HTML", "CSS"],
    },
    {
      title: "Backend",
      icon: Terminal,
      skills: ["Node.js", "Express", "Python", "Pyrogram", "aiohttp"],
    },
    {
      title: "Database",
      icon: Database,
      skills: ["MongoDB", "MySQL", "Redis", "PostgreSQL"],
    },
    {
      title: "Cloud & DevOps",
      icon: Cloud,
      skills: ["GitHub Actions", "Koyeb", "Vercel", "Docker (Basics)", "Git"],
    },
  ]);
  const [interests, setInterests] = useState<InterestDisplayItem[]>([
    { icon: Code2, label: "Telegram Bot Development" },
    { icon: Database, label: "Backend Architecture" },
    { icon: Palette, label: "UI Design" },
    { icon: Coffee, label: "Late-Night Debugging" },
  ]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (siteData) {
      const mappedTimeline = siteData.timeline.map((item: SiteTimelineItem) => ({
        ...item,
        icon: resolveIcon(item.icon)
      }));
      setTimeline(mappedTimeline);

      const formattedTechCategories = siteData.techStackCategories.map((category: TechCategoryResponse) => ({
        title: category.title,
        icon: resolveIcon(category.icon, Terminal),
        skills: category.skills,
      }));

      if (formattedTechCategories.length > 0) {
        setTechCategories(formattedTechCategories);
      }

      const formattedInterests = siteData.interests.map((interest: SiteInterest) => ({
        ...interest,
        icon: resolveIcon(interest.icon, Code2)
      }));

      if (formattedInterests.length > 0) {
        setInterests(formattedInterests);
      }

      setLoading(false);
      return;
    }

    if (error) {
      console.error('Error fetching data:', error);
        setTimeline([
          {
            year: "2025 - Present",
            role: "Network Engineering Student",
            company: "NIBM University",
            description:
              "Pursuing a degree in Network Engineering, focusing on networking fundamentals, system administration, and practical implementations of backend and cloud technologies.",
            icon: Cloud,
          },
          {
            year: "2024 - 2025",
            role: "Full-Stack Developer",
            company: "",
            description:
              "Designed and developed full-stack web applications with React, Express, and MongoDB, emphasizing scalable architecture, API integration, and responsive UI/UX design.",
            icon: Briefcase,
          },
          {
            year: "2023 - 2024",
            role: "Backend Developer",
            company: "",
            description:
              "Implemented robust backend systems, RESTful APIs, and asynchronous services using Node.js and Python, with a focus on reliability, modularity, and performance optimization.",
            icon: Terminal,
          },
          {
            year: "2022 - 2023",
            role: "Frontend Developer",
            company: "",
            description:
              "Developed responsive and interactive web interfaces using React and Tailwind CSS, applying best practices for usability, accessibility, and modern frontend architecture.",
            icon: Palette,
          },
        ]);
      setLoading(false);
      return;
    }

    setLoading(isLoading);
  }, [error, isLoading, siteData]);

  return (
    <div className="relative min-h-screen bg-background">
      <DynamicPageBackground />
      <PageSeo
        title="About | Pamod Madubashana"
        description="Learn about Pamod Madubashana's development journey, technical experience, and product engineering approach across full-stack web projects."
        path="/about"
        keywords={["About Pamod Madubashana", "developer journey", "software engineer", "full-stack experience"]}
        structuredData={{
          "@type": "ProfilePage",
          "@id": "https://pamod.is-a.dev/about#profile",
          url: "https://pamod.is-a.dev/about",
          name: "About Pamod Madubashana",
          mainEntity: {
            "@type": "Person",
            name: "Pamod Madubashana",
            jobTitle: "Full-Stack Developer",
            url: "https://pamod.is-a.dev/",
          },
        }}
      />
      <Navbar />
      <main className="route-transition-content relative z-10 pt-24 pb-20">
        <section className="section-shell">
          <div className="section-inner">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="page-hero-panel mx-auto max-w-4xl"
            >
              <span className="section-pill">IDENTITY PROFILE</span>
              <h1 className="section-title text-4xl md:text-5xl lg:text-6xl">
                <span className="text-foreground/80">Architecting Digital</span>{" "}
                <span className="text-gradient">Flows</span>
              </h1>
              <p className="section-copy mx-auto mt-5 max-w-2xl">
                Developer, automation builder, and self-hosting enthusiast working across web apps, bots, and resilient infrastructure.
              </p>
            </motion.div>
          </div>
        </section>

        {loading ? (
          <section className="section-shell">
            <div className="section-inner">
              <div className="page-glass-strip mx-auto max-w-xl p-10 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
                <p className="mt-4 text-muted-foreground">Loading journey...</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="section-shell">
            <div className="section-inner">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16 text-center text-3xl font-bold md:text-4xl"
              >
                <span className="text-foreground/80">System</span> <span className="text-gradient">Timeline</span>
              </motion.h2>

              <div className="relative mx-auto max-w-5xl">
                <div className="absolute bottom-0 left-8 top-0 w-px bg-primary/70 shadow-[0_0_18px_hsl(var(--primary)/0.5)] md:left-1/2" />

                {timeline.map((item, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <motion.div
                      key={item._id || item.year}
                      initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      className="relative mb-10 md:flex md:items-start"
                    >
                      <div className={`hidden md:block md:w-1/2 md:pr-12 ${isLeft ? "" : "md:invisible"}`}>
                        {isLeft && (
                          <div className="surface-card p-5 text-right backdrop-blur-sm md:p-6">
                        <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">{item.year}</span>
                            <h3 className="mt-2 text-xl font-semibold text-foreground">{item.role}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{item.company}</p>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="absolute left-8 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-primary/65 bg-card shadow-glow md:left-1/2">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>

                      <div className={`ml-20 md:ml-0 md:w-1/2 md:pl-12 ${isLeft ? "md:hidden" : ""}`}>
                        <div className="surface-card p-5 text-left backdrop-blur-sm md:p-6">
                          <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">{item.year}</span>
                          <h3 className="mt-2 text-xl font-semibold text-foreground">{item.role}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.company}</p>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="section-shell">
          <div className="section-inner">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center text-3xl font-bold md:text-4xl"
            >
              <span className="text-foreground/75">Tech</span> <span className="text-gradient">Stack</span>
            </motion.h2>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {techCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="surface-card backdrop-blur-sm"
                >
                  <div className="surface-icon mb-4">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-4 text-lg font-semibold text-foreground">{category.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span key={skill} className="chip-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="section-inner">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="mb-8 text-3xl font-bold md:text-4xl">
                <span className="text-foreground/75">Beyond</span> <span className="text-gradient">Code</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {interests.map((interest, index) => (
                  <motion.div
                    key={interest.label}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/35 px-4 py-2 backdrop-blur-sm"
                  >
                    <interest.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground/85">{interest.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default About;
