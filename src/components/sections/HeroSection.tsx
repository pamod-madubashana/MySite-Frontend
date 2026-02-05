import { Code, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedWaves from "@/components/AnimatedWaves";
import HeroPortrait from "@/components/HeroPortrait";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      
      {/* Animated waves */}
      <AnimatedWaves />
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-10 pb-20">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          {/* Portrait */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <HeroPortrait />
          </div>
          
          {/* Text content */}
          <div className="order-2 lg:order-1 text-center lg:text-left max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-foreground">Hi, I'm </span>
              <span className="bg-gradient-to-r from-primary via-teal-accent to-secondary bg-clip-text text-transparent">
                Pamod Madubashana
              </span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Full-Stack Developer
            </h2>
            
            <p className="text-muted-foreground text-lg md:text-xl mb-8 leading-relaxed">
              I build fast, reliable web applications with modern tools. I care about clean architecture, 
              thoughtful UX, and shipping features that scale
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              >
                <Code className="w-5 h-5 mr-2" />
                View Projects
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-muted-foreground/30 hover:border-primary hover:text-primary font-semibold px-8"
              >
                <Zap className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
          <span className="text-sm font-medium tracking-wider">SCROLL</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};
