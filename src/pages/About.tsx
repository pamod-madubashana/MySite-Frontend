import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Briefcase, GraduationCap, Award, Code2, 
  Database, Cloud, Palette, Terminal, 
  Heart, Coffee, Music, Mountain 
} from "lucide-react";
import { useState, useEffect } from 'react';
import { timelineApi, TimelineItem } from '@/api/timelineApi';
import { API_BASE_URL } from '@/lib/apiConfig';
import { aboutApi } from '@/api/aboutApi';
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

const About = () => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [techCategories, setTechCategories] = useState<any[]>([
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
  const [interests, setInterests] = useState<any[]>([
    { icon: Code2, label: "Telegram Bot Development" },
    { icon: Database, label: "Backend Architecture" },
    { icon: Palette, label: "UI Design" },
    { icon: Coffee, label: "Late-Night Debugging" },
  ]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // First check if we have cached data from home page pre-fetch
        const cachedData = aboutApi.getCachedAboutData();
        
        if (cachedData) {
          // Use cached data - no loading time!
          console.log('Using cached about page data');
          
          // Process timeline data
          const mappedTimeline = cachedData.timeline.map((item: TimelineItem) => ({
            ...item,
            icon: iconMap[item.icon as keyof typeof iconMap] || Briefcase
          }));
          setTimeline(mappedTimeline);
          
          // Process tech categories data
          const formattedTechCategories = cachedData.techCategories.map((category: any) => ({
            title: category.title,
            icon: iconMap[category.icon as keyof typeof iconMap] || iconMap['Terminal'],
            skills: category.skills,
          }));
          
          if (formattedTechCategories.length > 0) {
            setTechCategories(formattedTechCategories);
          }
          
          // Process interests data
          const formattedInterests = cachedData.interests.map((interest: any) => ({
            ...interest,
            icon: iconMap[interest.icon as keyof typeof iconMap] || Code2
          }));
          
          if (formattedInterests.length > 0) {
            setInterests(formattedInterests);
          }
          
          setLoading(false);
          return;
        }
        
        // Fallback to individual API calls if no cached data
        console.log('No cached data found, fetching from APIs');
        
        // Fetch timeline data
        const timelineData = await timelineApi.getTimeline();
        // Map the API data to match the expected format
        const mappedTimeline = timelineData.map((item: TimelineItem) => ({
          ...item,
          icon: iconMap[item.icon as keyof typeof iconMap] || Briefcase // default to Briefcase if icon not found
        }));
        setTimeline(mappedTimeline);
        
        // Fetch tech stack categories data
        const techStackResponse = await fetch(`${API_BASE_URL}/tech-stack-categories/public`);
        if (techStackResponse.ok) {
          const techStackCategories = await techStackResponse.json();
          // Map the API data to match the expected format
          const formattedTechCategories = techStackCategories.map((category: any) => ({
            title: category.title,
            icon: iconMap[category.icon as keyof typeof iconMap] || iconMap['Terminal'], // default icon
            skills: category.skills,
          }));
          
          if (formattedTechCategories.length > 0) {
            setTechCategories(formattedTechCategories);
          }
        }
        
        // Fetch interests data
        const interestsResponse = await fetch(`${API_BASE_URL}/interests/public`);
        if (interestsResponse.ok) {
          const interestsData = await interestsResponse.json();
          const formattedInterests = interestsData.map((interest: any) => ({
            ...interest,
            icon: iconMap[interest.icon as keyof typeof iconMap] || Code2 // default to Code2 if icon not found
          }));
          
          if (formattedInterests.length > 0) {
            setInterests(formattedInterests);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Still set default timeline if API fails
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <DynamicPageBackground />
      <PageSeo
        title="About | Pamod Madubashana"
        description="Learn about Pamod Madubashana's journey, technical background, and professional interests as a full-stack developer."
        path="/about"
      />
      <Navbar />
      <main className="relative z-10 pt-24 pb-20">
        <section className="section-shell">
          <div className="section-inner">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="page-hero-panel mx-auto max-w-4xl"
            >
              <span className="section-pill">About Me</span>
              <h1 className="section-title text-4xl md:text-5xl lg:text-6xl">
                <span className="text-foreground/75">Building the Future,</span>{" "}
                <span className="text-gradient">One Line at a Time</span>
              </h1>
              <p className="section-copy mx-auto mt-5 max-w-2xl">
                I&apos;m a passionate full-stack developer with 5+ years of experience creating digital experiences that combine beautiful design with powerful functionality.
              </p>
            </motion.div>
          </div>
        </section>

        {loading ? (
          <section className="section-shell section-shell-muted">
            <div className="section-inner">
              <div className="page-glass-strip mx-auto max-w-xl p-10 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
                <p className="mt-4 text-muted-foreground">Loading journey...</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="section-shell section-shell-muted">
            <div className="section-inner">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-16 text-center text-3xl font-bold md:text-4xl"
              >
                <span className="text-foreground/75">My</span> <span className="text-gradient">Journey</span>
              </motion.h2>

              <div className="relative mx-auto max-w-5xl">
                <div className="absolute bottom-0 left-8 top-0 w-px bg-primary md:left-1/2" />

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
                          <div className="surface-card p-5 text-right backdrop-blur-2xl md:p-6">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{item.year}</span>
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
                        <div className="surface-card p-5 text-left backdrop-blur-2xl md:p-6">
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{item.year}</span>
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
                  className="surface-card backdrop-blur-2xl"
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

        <section className="section-shell section-shell-muted">
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
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/35 px-4 py-2 backdrop-blur-2xl"
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
