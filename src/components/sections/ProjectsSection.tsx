import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { projectApi } from "@/api/projectApi";
import { ProjectCard } from "@/components/ui/ProjectCard";



export const ProjectsSection = () => {
  const [projects, setProjects] = useState<{
    _id: string;
    title: string;
    description: string;
    tags: string[];
    languages: string[];
    githubUrl?: string;
    liveUrl?: string;
    featured: boolean;
    status: 'draft' | 'published';
    thumbnail?: string;
    screenshots?: string[];
    createdAt: string;
    updatedAt: string;
  }[]>([]);
  const [githubStats, setGithubStats] = useState<{[key: string]: {stars: number, forks: number}}>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjectsAndStats = async () => {
      try {
        const response = await projectApi.getProjects({ limit: 3 });
        setProjects(response.projects);
        
        // Fetch GitHub stats for each project with a GitHub URL
        const stats: {[key: string]: {stars: number, forks: number}} = {};
        for (const project of response.projects) {
          if (project.githubUrl) {
            try {
              // Extract owner and repo from GitHub URL
              const urlParts = project.githubUrl.replace('https://github.com/', '').split('/');
              if (urlParts.length >= 2) {
                const owner = urlParts[0];
                const repo = urlParts[1].split('/')[0]; // Get just the repo name, remove any additional path
                              
                let githubResponse;
                try {
                  githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
                } catch (fetchErr) {
                  // If fetch fails (network error), continue to next project
                  continue;
                }
                              
                if (githubResponse && githubResponse.ok) {
                  const data = await githubResponse.json();
                  stats[project._id] = {
                    stars: data.stargazers_count,
                    forks: data.forks_count
                  };
                }
              }
            } catch (err) {
              // Silently ignore GitHub API errors to avoid console spam
            }
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
  
  if (loading) {
    return (
      <section id="projects" className="py-20 md:py-32 relative bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 text-sm font-medium text-secondary bg-secondary/10 rounded-full mb-4">
              Featured Work
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground/70">Recent</span> <span className="text-gradient">Projects</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Loading projects...
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 md:py-32 relative bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 text-sm font-medium text-secondary bg-secondary/10 rounded-full mb-4">
              Featured Work
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground/70">Recent</span> <span className="text-gradient">Projects</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No recent projects found
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="projects" className="py-20 md:py-32 relative bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 text-sm font-medium text-secondary bg-secondary/10 rounded-full mb-4">
            Featured Work
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground/70">Recent</span> <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A selection of my recent work. Each project represents a unique challenge and learning experience.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              index={index}
              githubStats={githubStats[project._id]}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/projects">
              <Code className="w-5 h-5 mr-2 text-foreground/70" />
              <span className="text-foreground/70">View All Projects</span>
              <motion.span
                className="ml-2 text-foreground/70"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
