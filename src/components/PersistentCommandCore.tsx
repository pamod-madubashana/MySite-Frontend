import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CommandCore3D from "@/components/CommandCore3D";

type CommandSection = "home" | "about" | "projects" | "articles";

interface CommandCoreTarget {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

const desktopStates: Record<CommandSection, CommandCoreTarget> = {
  home: { x: 25, y: 0, scale: 1, opacity: 0.88 },
  about: { x: -24, y: 2, scale: 0.72, opacity: 0.36 },
  projects: { x: 30, y: 0, scale: 0.62, opacity: 0.44 },
  articles: { x: -14, y: 7, scale: 0.56, opacity: 0.34 },
};

const mobileStates: Record<CommandSection, CommandCoreTarget> = {
  home: { x: 0, y: 18, scale: 0.62, opacity: 0.58 },
  about: { x: 0, y: -28, scale: 0.42, opacity: 0.25 },
  projects: { x: 0, y: 30, scale: 0.34, opacity: 0.3 },
  articles: { x: 0, y: 12, scale: 0.32, opacity: 0.24 },
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

const getHomeScrollTarget = (states: Record<CommandSection, CommandCoreTarget>): CommandCoreTarget => {
  const measuredSections = homeSectionOrder
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
    .filter((section): section is { id: CommandSection; center: number } => Boolean(section));

  if (measuredSections.length === 0) {
    return states.home;
  }

  const viewportCenter = window.scrollY + window.innerHeight * 0.5;

  if (viewportCenter <= measuredSections[0].center) {
    return states[measuredSections[0].id];
  }

  const lastSection = measuredSections[measuredSections.length - 1];
  if (viewportCenter >= lastSection.center) {
    return states[lastSection.id];
  }

  for (let index = 0; index < measuredSections.length - 1; index += 1) {
    const current = measuredSections[index];
    const next = measuredSections[index + 1];

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
  const initialStateRef = useRef<CommandCoreTarget | null>(null);

  if (!initialStateRef.current) {
    const states = typeof window === "undefined" ? desktopStates : getStates();
    initialStateRef.current = states[getSectionFromPath(location.pathname)];
  }

  const animatedStateRef = useRef(initialStateRef.current);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    viewportModeRef.current = viewportMode;
  }, [viewportMode]);

  useEffect(() => {
    const handleResize = () => {
      setViewportMode(getViewportMode());
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let frameId = 0;

    const animate = () => {
      const states = viewportModeRef.current === "mobile" ? mobileStates : desktopStates;
      const target =
        pathnameRef.current === "/"
          ? getHomeScrollTarget(states)
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
        containerRef.current.style.transform = `translate3d(${next.x}%, ${next.y}%, 0) scale(${next.scale})`;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const initialState = initialStateRef.current;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden will-change-transform [backface-visibility:hidden] [contain:layout_paint_style]"
      style={{
        opacity: initialState.opacity,
        transform: `translate3d(${initialState.x}%, ${initialState.y}%, 0) scale(${initialState.scale})`,
      }}
    >
      <CommandCore3D />
    </div>
  );
};

export default PersistentCommandCore;
