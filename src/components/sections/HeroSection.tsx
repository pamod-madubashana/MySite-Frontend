import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/TransitionLink";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const rise = (delay: number) => ({
    initial: shouldAnimate ? { opacity: 0, y: 8 } : false,
    animate: shouldAnimate ? { opacity: 1, y: 0 } : undefined,
    transition: shouldAnimate ? { duration: 0.4, delay, ease: EASE } : undefined,
  });

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center px-6 pb-16 pt-28 md:px-8 md:pb-20"
    >
      <div className="container relative z-10 mx-auto w-full">
        <motion.div {...rise(0)} className="max-w-xl">
          <h1 className="text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.5rem]">
            Pamod Madubashana
          </h1>
          <p className="mt-5 max-w-md text-lg leading-7 text-muted-foreground md:text-xl md:leading-8">
            Developer, automation builder, self-hosting enthusiast
          </p>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground md:text-[0.95rem] md:leading-7">
            I build bots, web apps, automation tools, and self-hosted systems with clean UI,
            practical workflows, and reliable deployments.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="sm"
              className="h-11 rounded-lg bg-primary px-5 text-primary-foreground transition-colors duration-150 hover:bg-primary/90 sm:px-6"
            >
              <TransitionLink to="/projects">View projects</TransitionLink>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-11 rounded-lg border-foreground/10 bg-transparent px-5 text-foreground transition-colors duration-150 hover:border-foreground/25 hover:bg-foreground/[0.04] sm:px-6"
            >
              <TransitionLink to="/about">About</TransitionLink>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
