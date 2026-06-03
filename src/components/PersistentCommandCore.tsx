import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CommandCore3D from "@/components/CommandCore3D";

type CommandSection = "home" | "about" | "projects" | "articles";

interface CommandCoreTarget {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

interface SectionCenter {
  id: CommandSection;
  center: number;
}

const desktopStates: Record<CommandSection, CommandCoreTarget> = {
  home: { x: 25, y: 0, scale: 0.86, opacity: 0.88 },
  about: { x: -24, y: 2, scale: 0.72, opacity: 0.36 },
  projects: { x: 30, y: 0, scale: 0.62, opacity: 0.44 },
  articles: { x: -14, y: 7, scale: 0.56, opacity: 0.34 },
};

const mobileStates: Record<CommandSection, CommandCoreTarget> = {
  home: { x: 0, y: -12, scale: 1, opacity: 0.34 },
  about: { x: -18, y: -34, scale: 1, opacity: 0.18 },
  projects: { x: 18, y: 8, scale: 1, opacity: 0.22 },
  articles: { x: -14, y: -4, scale: 1, opacity: 0.16 },
};

const homeSectionOrder: CommandSection[] = ["home", "about", "projects"];

const getViewportMode = () => (window.innerWidth < 768 ? "mobile" : "desktop");

const getStates = () => (getViewportMode() === "mobile" ? mobileStates : desktopStates);

const getSectionFromPath = (pathname: string): CommandSection => {
  if (pathname.startsWith("/about")) {
    return "about";
  }

  if (pathname.startsWith("/projects")) {
    return "projects";
  }

  if (pathname.startsWith("/articles")) {
    return "articles";
  }

  return "home";
};

const lerp = (current: number, target: number, amount: number) => current + (target - current) * amount;

const smoothStep = (value: number) => value * value * (3 - 2 * value);

const mixTargets = (from: CommandCoreTarget, to: CommandCoreTarget, progress: number): CommandCoreTarget => ({
  x: lerp(from.x, to.x, progress),
  y: lerp(from.y, to.y, progress),
  scale: lerp(from.scale, to.scale, progress),
  opacity: lerp(from.opacity, to.opacity, progress),
});

const getHomeScrollTarget = (
  states: Record<CommandSection, CommandCoreTarget>,
  sectionCenters: SectionCenter[]
): CommandCoreTarget => {
  if (sectionCenters.length === 0) {
    return states.home;
  }

  const viewportCenter = window.scrollY + window.innerHeight * 0.5;

  if (viewportCenter <= sectionCenters[0].center) {
    return states[sectionCenters[0].id];
  }

  const lastSection = sectionCenters[sectionCenters.length - 1];
  if (viewportCenter >= lastSection.center) {
    return states[lastSection.id];
  }

  for (let index = 0; index < sectionCenters.length - 1; index += 1) {
    const current = sectionCenters[index];
    const next = sectionCenters[index + 1];

    if (viewportCenter >= current.center && viewportCenter <= next.center) {
      const rawProgress = (viewportCenter - current.center) / Math.max(next.center - current.center, 1);
      return mixTargets(states[current.id], states[next.id], smoothStep(rawProgress));
    }
  }

  return states.home;
};

const PersistentCommandCore = () => {
  const location = useLocation();
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">(() =>
    typeof window === "undefined" ? "desktop" : getViewportMode()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(location.pathname);
  const viewportModeRef = useRef(viewportMode);
  const sectionCentersRef = useRef<SectionCenter[]>([]);
  const initialStateRef = useRef<CommandCoreTarget | null>(null);

  if (!initialStateRef.current) {
    const states = typeof window === "undefined" ? desktopStates : getStates();
    initialStateRef.current = states[getSectionFromPath(location.pathname)];
  }

  const animatedStateRef = useRef(initialStateRef.current);

  const updateSectionCenters = useCallback(() => {
    sectionCentersRef.current = homeSectionOrder
      .map((sectionId) => {
        const element = document.getElementById(sectionId);
        if (!element) {
          return null;
        }

        return {
          id: sectionId,
          center: element.offsetTop + element.offsetHeight * 0.5,
        };
      })
      .filter((section): section is SectionCenter => Boolean(section));
  }, []);

  useEffect(() => {
    pathnameRef.current = location.pathname;
    window.requestAnimationFrame(updateSectionCenters);
  }, [location.pathname, updateSectionCenters]);

  useEffect(() => {
    viewportModeRef.current = viewportMode;
  }, [viewportMode]);

  useEffect(() => {
    const handleResize = () => {
      setViewportMode(getViewportMode());
      updateSectionCenters();
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => window.removeEventListener("resize", handleResize);
  }, [updateSectionCenters]);

  useEffect(() => {
    let frameId = 0;

    const animate = () => {
      const isMobile = viewportModeRef.current === "mobile";
      const states = isMobile ? mobileStates : desktopStates;
      const target =
        pathnameRef.current === "/"
          ? getHomeScrollTarget(states, sectionCentersRef.current)
          : states[getSectionFromPath(pathnameRef.current)];
      const current = animatedStateRef.current;
      const next = {
        x: lerp(current.x, target.x, 0.18),
        y: lerp(current.y, target.y, 0.18),
        scale: lerp(current.scale, target.scale, 0.16),
        opacity: lerp(current.opacity, target.opacity, 0.18),
      };

      animatedStateRef.current = next;
      if (containerRef.current) {
        containerRef.current.style.opacity = String(next.opacity);
        containerRef.current.style.transform = `translate3d(${next.x}%, ${next.y}%, 0) scale(${isMobile ? 1 : next.scale})`;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const initialState = initialStateRef.current;
  const initialScale = viewportMode === "mobile" ? 1 : initialState.scale;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed -inset-x-[18vw] -inset-y-[18vh] z-[5] overflow-visible will-change-transform [backface-visibility:hidden] [contain:layout_paint_style]"
      style={{
        opacity: initialState.opacity,
        transform: `translate3d(${initialState.x}%, ${initialState.y}%, 0) scale(${initialScale})`,
      }}
    >
      <CommandCore3D />
    </div>
  );
};

export default PersistentCommandCore;
