import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/TransitionLink";
import { useBootReveal } from "@/lib/bootReveal";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HERO_START_DELAY = 0;

export const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;
  const doorOpen = useBootReveal();
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    if (!doorOpen || heroReady) {
      return;
    }

    if (prefersReducedMotion) {
      setHeroReady(true);
      return;
    }

    const timer = window.setTimeout(() => setHeroReady(true), HERO_START_DELAY);
    return () => window.clearTimeout(timer);
  }, [doorOpen, heroReady, prefersReducedMotion]);

  const rise = (delay: number) => ({
    initial: shouldAnimate ? { opacity: 0, y: 14 } : false,
    animate: shouldAnimate
      ? heroReady
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 14 }
      : undefined,
    transition: shouldAnimate ? { duration: 0.55, delay, ease: EASE } : undefined,
  });

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center px-6 pb-16 pt-28 md:px-8 md:pb-20"
    >
      <div className="container relative z-10 mx-auto w-full">
        <div className="max-w-xl">
          <motion.h1
            {...rise(0)}
            className="text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.5rem]"
          >
            Pamod Madubashana
          </motion.h1>
          <motion.p
            {...rise(0.09)}
            className="mt-5 max-w-md text-lg leading-7 text-muted-foreground md:text-xl md:leading-8"
          >
            Developer, automation builder, self-hosting enthusiast
          </motion.p>
          <motion.p
            {...rise(0.18)}
            className="mt-6 max-w-md text-sm leading-6 text-muted-foreground md:text-[0.95rem] md:leading-7"
          >
            I build bots, web apps, automation tools, and self-hosted systems with clean UI,
            practical workflows, and reliable deployments.
          </motion.p>
          <motion.div {...rise(0.27)} className="mt-8 flex flex-wrap gap-3">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};
