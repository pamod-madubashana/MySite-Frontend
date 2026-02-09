import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { useSettings } from "@/contexts/SettingsContext";
import { useEffect } from 'react';
import { aboutApi } from '@/api/aboutApi';
import PageSeo from "@/components/seo/PageSeo";
import DynamicPageBackground from "@/components/DynamicPageBackground";

const Index = () => {
  const { settings, loading } = useSettings();
  
  // Pre-fetch about page data when home page loads
  useEffect(() => {
    // Start pre-fetching in background without blocking UI
    aboutApi.prefetchAboutData();
  }, []);
  
  if (loading) {
    return (
      <>
        <PageSeo
          title="Pamod Madubashana | Full-Stack Developer Portfolio"
          description="Explore the portfolio of Pamod Madubashana, a full-stack developer building scalable web applications with React, Node.js, clean architecture, and high-performance UX."
          path="/"
          keywords={["Pamod Madubashana", "full-stack developer", "React developer", "Node.js", "portfolio"]}
        />
        <div className="relative min-h-screen bg-background">
          <DynamicPageBackground />
          <div className="relative z-10 flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <div className="relative min-h-screen bg-background">
      <DynamicPageBackground />
      <PageSeo
        title="Pamod Madubashana | Full-Stack Developer Portfolio"
        description="Explore the portfolio of Pamod Madubashana, a full-stack developer building scalable web applications with React, Node.js, clean architecture, and high-performance UX."
        path="/"
        keywords={["Pamod Madubashana", "full-stack developer", "React developer", "Node.js", "portfolio"]}
      />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        {settings?.siteSections.showProjects && <ProjectsSection />}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
