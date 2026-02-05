import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { useSettings } from "@/contexts/SettingsContext";
import { useEffect } from 'react';
import { aboutApi } from '@/api/aboutApi';

const Index = () => {
  const { settings, loading } = useSettings();
  
  // Pre-fetch about page data when home page loads
  useEffect(() => {
    // Start pre-fetching in background without blocking UI
    aboutApi.prefetchAboutData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        {settings?.siteSections.showProjects && <ProjectsSection />}
        {settings?.siteSections.showContact && <ContactSection />}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
