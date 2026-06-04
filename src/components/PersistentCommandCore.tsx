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
  home: { x: 25, y: 0, scale: 0.82, opacity: 0.88 },
  about: { x: -24, y: 2, scale: 0.82, opacity: 0.36 },
  projects: { x: 30, y: 0, scale: 0.82, opacity: 0.44 },
  articles: { x: -14, y: 7, scale: 0.82, opacity: 0.34 },
};

const mobileStates: Record<CommandSection, CommandCoreTarget> = {
  home: { x: 8, y: -12, scale: 1, opacity: 0.58 },
  about: { x: 2, y: -34, scale: 1, opacity: 0.28 },
  projects: { x: 10, y: 8, scale: 1, opacity: 0.32 },
  articles: { x: 4, y: -4, scale: 1, opacity: 0.24 },
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
  const targetStateRef = useRef<CommandCoreTarget | null>(null);
  const frameIdRef = useRef(0);
  const recalcTimeoutsRef = useRef<number[]>([]);
  const reducedMotionRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  if (!initialStateRef.current) {
    const states = typeof window === "undefined" ? desktopStates : getStates();
    initialStateRef.current = states[getSectionFromPath(location.pathname)];
  }

  const animatedStateRef = useRef(initialStateRef.current);
  targetStateRef.current = targetStateRef.current || initialStateRef.current;

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

  const scheduleSectionRefresh = useCallback(() => {
    recalcTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    recalcTimeoutsRef.current = [];

    const refresh = () => {
      updateSectionCenters();
      updateTargetRef.current?.();
    };

    window.requestAnimationFrame(refresh);
    [120, 360, 900].forEach((delay) => {
      recalcTimeoutsRef.current.push(window.setTimeout(refresh, delay));
    });
  }, [updateSectionCenters]);

  const resolveTarget = useCallback(() => {
    const isMobile = viewportModeRef.current === "mobile";
    const states = isMobile ? mobileStates : desktopStates;

    if (pathnameRef.current === "/" && sectionCentersRef.current.length === 0) {
      updateSectionCenters();
    }

    return pathnameRef.current === "/"
      ? getHomeScrollTarget(states, sectionCentersRef.current)
      : states[getSectionFromPath(pathnameRef.current)];
  }, [updateSectionCenters]);

  const applyState = useCallback((state: CommandCoreTarget) => {
    const isMobile = viewportModeRef.current === "mobile";

    if (containerRef.current) {
      containerRef.current.style.opacity = String(state.opacity);
      containerRef.current.style.transform = `translate3d(${state.x}%, ${state.y}%, 0) scale(${isMobile ? 1 : state.scale})`;
    }
  }, []);

  const updateTarget = useCallback(() => {
    const target = resolveTarget();
    targetStateRef.current = target;
    animatedStateRef.current = target;
    applyState(target);
  }, [applyState, resolveTarget]);

  const updateTargetRef = useRef(updateTarget);

  useEffect(() => {
    updateTargetRef.current = updateTarget;
  }, [updateTarget]);

  useEffect(() => {
    pathnameRef.current = location.pathname;
    scheduleSectionRefresh();
  }, [location.pathname, scheduleSectionRefresh]);

  useEffect(() => {
    viewportModeRef.current = viewportMode;
  }, [viewportMode]);

  useEffect(() => {
    const handleResize = () => {
      setViewportMode(getViewportMode());
      scheduleSectionRefresh();
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("public-site-data:loaded", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("public-site-data:loaded", handleResize);
      recalcTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      recalcTimeoutsRef.current = [];
    };
  }, [scheduleSectionRefresh]);

  useEffect(() => {
    const observedSections = homeSectionOrder
      .map((sectionId) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => Boolean(section));

    if (observedSections.length === 0 || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(scheduleSectionRefresh);
    observedSections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [location.pathname, scheduleSectionRefresh]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      setPrefersReducedMotion(motionQuery.matches);
      updateTarget();
    };

    handleMotionPreference();
    motionQuery.addEventListener("change", handleMotionPreference);

    return () => motionQuery.removeEventListener("change", handleMotionPreference);
  }, [updateTarget]);

  useEffect(() => {
    const handleScroll = () => updateTarget();

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateTarget]);

  useEffect(() => {
    const animate = () => {
      if (reducedMotionRef.current) {
        frameIdRef.current = 0;
        return;
      }

      const isMobile = viewportModeRef.current === "mobile";
      const target = targetStateRef.current || resolveTarget();
      const current = animatedStateRef.current;
      const next = {
        x: lerp(current.x, target.x, 0.42),
        y: lerp(current.y, target.y, 0.42),
        scale: lerp(current.scale, target.scale, 0.36),
        opacity: lerp(current.opacity, target.opacity, 0.4),
      };

      animatedStateRef.current = next;
      applyState(next);

      const isSettled =
        Math.abs(next.x - target.x) < 0.6 &&
        Math.abs(next.y - target.y) < 0.6 &&
        Math.abs(next.scale - target.scale) < 0.018 &&
        Math.abs(next.opacity - target.opacity) < 0.035;

      if (isSettled) {
        animatedStateRef.current = target;
        applyState(target);
        frameIdRef.current = 0;
        return;
      }

      frameIdRef.current = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!frameIdRef.current && !reducedMotionRef.current) {
        frameIdRef.current = window.requestAnimationFrame(animate);
      }
    };

    startAnimation();
    window.addEventListener("scroll", startAnimation, { passive: true });
    window.addEventListener("resize", startAnimation, { passive: true });
    window.addEventListener("public-site-data:loaded", startAnimation, { passive: true });

    return () => {
      window.removeEventListener("scroll", startAnimation);
      window.removeEventListener("resize", startAnimation);
      window.removeEventListener("public-site-data:loaded", startAnimation);
      if (frameIdRef.current) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [applyState, resolveTarget]);

  const initialState = initialStateRef.current;
  const initialScale = viewportMode === "mobile" ? 1 : initialState.scale;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed -inset-x-[18vw] -inset-y-[18vh] z-[5] overflow-visible will-change-[transform,opacity] [backface-visibility:hidden] [contain:layout_paint_style]"
      style={{
        opacity: initialState.opacity,
        transform: `translate3d(${initialState.x}%, ${initialState.y}%, 0) scale(${initialScale})`,
      }}
    >
      <CommandCore3D isActive={!prefersReducedMotion} />
    </div>
  );
};

export default PersistentCommandCore;
