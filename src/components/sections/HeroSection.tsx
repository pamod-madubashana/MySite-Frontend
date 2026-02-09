import { Code, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedWaves from "@/components/AnimatedWaves";
import HeroPortrait from "@/components/HeroPortrait";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative flex min-h-[100svh] items-start overflow-hidden pb-10 pt-20 sm:pb-12 sm:pt-24 md:min-h-screen md:items-center md:justify-center md:py-0">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />

      {/* Subtle darkening behind portrait for natural transition */}
      <div className="absolute left-1/2 top-[42%] h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 bg-radial-gradient(circle, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 58%, transparent 100%) sm:h-[460px] sm:w-[460px] md:top-1/2 md:h-[500px] md:w-[500px]" />

      {/* Animated waves */}
      <div className="absolute inset-0 opacity-55 sm:opacity-70">
        <AnimatedWaves />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] sm:opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-5 md:flex-row md:gap-12 lg:gap-16">
          {/* Portrait */}
          <div className="order-2 flex w-full justify-center md:order-1 md:w-[54%] md:justify-start">
            <HeroPortrait />
          </div>

          {/* Text content */}
          <div className="order-1 w-full max-w-xl text-center md:order-2 md:w-[46%] md:text-left">
            <div className="rounded-2xl border border-border/50 bg-card/35 p-5 backdrop-blur-md sm:p-6 md:border-border/40 md:bg-card/20 md:p-7">
              <h1 className="text-4xl font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-[2.65rem] md:text-5xl lg:text-6xl">
                <span className="text-foreground">Hi, I&apos;m </span>
                <span className="block bg-gradient-to-r from-primary via-teal-accent to-secondary bg-clip-text text-transparent sm:inline">
                  Pamod Madubashana
                </span>
              </h1>

              <h2 className="mt-3 text-base font-semibold text-foreground/90 sm:text-lg md:text-2xl lg:text-3xl">
                Full-Stack Developer
              </h2>

              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg md:text-lg lg:text-xl">
                I build fast, reliable web applications with modern tools. I care about clean architecture,
                thoughtful UX, and shipping features that scale.
              </p>

              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 w-full min-w-0 bg-primary px-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 sm:px-5 sm:text-base"
                >
                  <Link to="/projects" className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                    <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>View Projects</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 w-full min-w-0 border-primary/40 bg-transparent px-3 text-sm font-semibold text-primary transition-all duration-300 hover:scale-[1.02] hover:bg-primary/10 hover:text-primary sm:px-5 sm:text-base"
                >
                  <Link to="/about" className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                    <span>About Me</span>
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
