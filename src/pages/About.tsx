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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-6">
                About Me
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-foreground/70">Building the Future,</span>{" "}
                <span className="text-gradient">One Line at a Time</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                I'm a passionate full-stack developer with 5+ years of experience creating 
                digital experiences that combine beautiful design with powerful functionality.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <section className="py-16 bg-muted/20">
            <div className="container mx-auto px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center mb-16"
              >
                <span className="text-foreground/70">My</span> <span className="text-gradient">Journey</span>
              </motion.h2>

              <div className="max-w-4xl mx-auto relative">
                {/* Timeline Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border" />

                {timeline.map((item, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <motion.div
                      key={item._id || item.year}
                      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative mb-12 md:flex md:items-start"
                    >
                      {/* Left Card (even index) */}
                      <div className={`hidden md:block md:w-1/2 md:pr-12 ${isLeft ? "" : "md:invisible"}`}>
                        {isLeft && (
                          <div className="p-6 rounded-xl glass hover-lift text-right">
                            <span className="text-sm font-mono text-primary">{item.year}</span>
                            <h3 className="text-xl font-semibold mt-1 text-foreground/50">{item.role}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.company}</p>
                            <p className="text-sm text-muted-foreground mt-3">{item.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Timeline Dot - Centered */}
                      <div className="absolute z-10 left-8 md:left-1/2 -translate-x-1/2 top-0 w-12 h-12 rounded-full bg-card border-4 border-primary flex items-center justify-center shadow-glow">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>

                      {/* Right Card (odd index) - Shows on desktop and mobile */}
                      <div className={`ml-20 md:ml-0 md:w-1/2 md:pl-12 ${isLeft ? "md:hidden" : ""}`}>
                        <div className="p-6 rounded-xl glass hover-lift text-left">
                          <span className="text-sm font-mono text-primary">{item.year}</span>
                          <h3 className="text-xl font-semibold mt-1 text-foreground/50">{item.role}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.company}</p>
                          <p className="text-sm text-muted-foreground mt-3">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Tech Stack Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-center mb-16"
            >
              <span className="text-foreground/70">Tech</span> <span className="text-gradient">Stack</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {techCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-xl glass hover-lift"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground/50">{category.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs font-mono bg-muted/50 text-foreground/30 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interests Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                <span className="text-foreground/70">Beyond </span><span className="text-gradient">Code</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {interests.map((interest, index) => (
                  <motion.div
                    key={interest.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full glass"
                  >
                    <interest.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground/50">{interest.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;