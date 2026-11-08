import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CommandCore3D, { type CoreMotionState } from "@/components/CommandCore3D";
import { useBootReveal } from "@/lib/bootReveal";

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

interface UpdateTargetOptions {
  immediate?: boolean;
}

const desktopStates: Record<CommandSection, CommandCoreTarget> = {
  home: { x: 24, y: 0, scale: 0.82, opacity: 0.88 },
  about: { x: -30, y: 6, scale: 0.82, opacity: 0.4 },
  projects: { x: 12, y: 16, scale: 0.82, opacity: 0.46 },
  articles: { x: -6, y: -18, scale: 0.82, opacity: 0.38 },
};

const mobileStates: Record<CommandSection, CommandCoreTarget> = {
  home: { x: 8, y: 0, scale: 1, opacity: 0.58 },
  about: { x: -8, y: -30, scale: 1, opacity: 0.3 },
  projects: { x: 12, y: 2, scale: 1, opacity: 0.34 },
  articles: { x: -2, y: -18, scale: 1, opacity: 0.28 },
};

const homeSectionOrder: CommandSection[] = ["home", "about", "projects"];

const getViewportMode = () => (window.innerWidth < 768 ? "mobile" : "desktop");

const getStates = () => (getViewportMode() === "mobile" ? mobileStates : desktopStates);

const CORE_START_TRANSFORM = "translate3d(0px, 48px, 0px) scale(0.06)";

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

const getRouteTarget = (pathname: string, states: Record<CommandSection, CommandCoreTarget>): CommandCoreTarget =>
  states[getSectionFromPath(pathname)];

const PersistentCommandCore = () => {
  const { pathname } = useLocation();
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">(() =>
    typeof window === "undefined" ? "desktop" : getViewportMode()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  const viewportModeRef = useRef(viewportMode);
  const sectionCentersRef = useRef<SectionCenter[]>([]);
  const initialStateRef = useRef<CommandCoreTarget | null>(null);
  const targetStateRef = useRef<CommandCoreTarget | null>(null);
  const frameIdRef = useRef(0);
  const recalcTimeoutsRef = useRef<number[]>([]);
  const routeTransitionTimeoutRef = useRef(0);
  const startAnimationRef = useRef<() => void>(() => {});
  const routeAnimationUntilRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const velRef = useRef(0);
  const lastScrollYRef = useRef(typeof window === "undefined" ? 0 : window.scrollY);
  const lastTimeRef = useRef(0);
  const dynYRef = useRef(0);
  const tiltXRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  if (!initialStateRef.current) {
    const states = typeof window === "undefined" ? desktopStates : getStates();
    initialStateRef.current = states[getSectionFromPath(pathname)];
  }

  const animatedStateRef = useRef(initialStateRef.current);
  targetStateRef.current = targetStateRef.current || initialStateRef.current;

  const coreStateRef = useRef<CoreMotionState>({
    scale: viewportMode === "mobile" ? 1 : initialStateRef.current.scale,
    offsetX: 0,
    offsetY: 0,
    tiltX: 0,
    tiltY: 0,
  });

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

  const scheduleSectionRefresh = useCallback((options: UpdateTargetOptions = {}) => {
    recalcTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    recalcTimeoutsRef.current = [];

    const refresh = () => {
      updateSectionCenters();
      updateTargetRef.current?.(options);
    };

    window.requestAnimationFrame(refresh);
    [120, 360, 900].forEach((delay) => {
      recalcTimeoutsRef.current.push(window.setTimeout(refresh, delay));
    });
  }, [updateSectionCenters]);

  const resolveTarget = useCallback(() => {
    const isMobile = viewportModeRef.current === "mobile";
    const states = isMobile ? mobileStates : desktopStates;

    if (Date.now() < routeAnimationUntilRef.current) {
      return getRouteTarget(pathnameRef.current, states);
    }

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
      containerRef.current.style.transform = `translate3d(${state.x}%, ${state.y}%, 0)`;
    }

    coreStateRef.current.scale = isMobile ? 1 : state.scale;
  }, []);

  const animateRouteTarget = useCallback((pathname: string) => {
    const states = viewportModeRef.current === "mobile" ? mobileStates : desktopStates;
    const target = getRouteTarget(pathname, states);

    targetStateRef.current = target;
    animatedStateRef.current = target;

    if (!containerRef.current) {
      return;
    }

    window.clearTimeout(routeTransitionTimeoutRef.current);
    containerRef.current.style.transition =
      "transform 980ms cubic-bezier(0.16, 1, 0.3, 1), opacity 820ms ease";

    window.requestAnimationFrame(() => {
      applyState(target);
    });

    routeTransitionTimeoutRef.current = window.setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = "";
      }
    }, 1050);
  }, [applyState]);

  const updateTarget = useCallback(() => {
    const target = resolveTarget();
    targetStateRef.current = target;

    animatedStateRef.current = target;
    applyState(target);
  }, [applyState, resolveTarget]);

  const updateTargetRef = useRef<(options?: UpdateTargetOptions) => void>(updateTarget);

  const updateTargetSmooth = useCallback((options: UpdateTargetOptions = {}) => {
    const target = resolveTarget();
    targetStateRef.current = target;

    if (options.immediate !== false || reducedMotionRef.current) {
      animatedStateRef.current = target;
      applyState(target);
      return;
    }

    startAnimationRef.current();
  }, [applyState, resolveTarget]);

  useEffect(() => {
    updateTargetRef.current = updateTargetSmooth;
  }, [updateTargetSmooth]);

  useEffect(() => {
    pathnameRef.current = pathname;
    routeAnimationUntilRef.current = Date.now() + 1100;
    animateRouteTarget(pathname);
    scheduleSectionRefresh({ immediate: false });
  }, [animateRouteTarget, pathname, scheduleSectionRefresh]);

  useEffect(() => {
    viewportModeRef.current = viewportMode;
  }, [viewportMode]);

  useEffect(() => {
    const handleResize = () => {
      setViewportMode(getViewportMode());
      scheduleSectionRefresh({ immediate: true });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("public-site-data:loaded", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("public-site-data:loaded", handleResize);
      recalcTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      recalcTimeoutsRef.current = [];
      window.clearTimeout(routeTransitionTimeoutRef.current);
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
  }, [pathname, scheduleSectionRefresh]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      setPrefersReducedMotion(motionQuery.matches);
      updateTarget();
      startAnimationRef.current();
    };

    handleMotionPreference();
    motionQuery.addEventListener("change", handleMotionPreference);

    return () => motionQuery.removeEventListener("change", handleMotionPreference);
  }, [updateTarget]);

  useEffect(() => {
    const handleScroll = () => {
      updateTargetSmooth({ immediate: Date.now() >= routeAnimationUntilRef.current });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateTargetSmooth]);

  useEffect(() => {
    const animate = (time: number) => {
      if (reducedMotionRef.current) {
        frameIdRef.current = 0;
        return;
      }

      const target = targetStateRef.current || resolveTarget();
      const current = animatedStateRef.current;
      const next = {
        x: lerp(current.x, target.x, 0.16),
        y: lerp(current.y, target.y, 0.16),
        scale: lerp(current.scale, target.scale, 0.14),
        opacity: lerp(current.opacity, target.opacity, 0.18),
      };

      const isSettled =
        Math.abs(next.x - target.x) < 0.18 &&
        Math.abs(next.y - target.y) < 0.18 &&
        Math.abs(next.scale - target.scale) < 0.006 &&
        Math.abs(next.opacity - target.opacity) < 0.012;

      if (isSettled) {
        animatedStateRef.current = target;
        applyState(target);
      } else {
        animatedStateRef.current = next;
        applyState(next);
      }

      const dtSec = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const scrollY = window.scrollY;
      const dy = scrollY - lastScrollYRef.current;
      lastScrollYRef.current = scrollY;

      const instantVel = dtSec > 0 ? dy / dtSec : 0;
      const velAlpha = Math.min(1, 10 * dtSec);
      velRef.current += (instantVel - velRef.current) * velAlpha;

      const spring = 1 - Math.exp(-6 * dtSec);
      const inertiaTargetY = Math.max(-70, Math.min(70, velRef.current * 0.03));
      const tiltTargetX = Math.max(-7, Math.min(7, velRef.current * 0.002));
      dynYRef.current += (inertiaTargetY - dynYRef.current) * spring;
      tiltXRef.current += (tiltTargetX - tiltXRef.current) * spring;

      const elapsed = time * 0.001;
      const floatY = Math.sin(elapsed * 0.9) * 5;
      const floatX = Math.sin(elapsed * 0.6 + 1.7) * 3.5;
      const tiltY = Math.sin(elapsed * 0.45) * 1.5;

      coreStateRef.current.offsetX = floatX;
      coreStateRef.current.offsetY = floatY + dynYRef.current;
      coreStateRef.current.tiltX = tiltXRef.current;
      coreStateRef.current.tiltY = tiltY;

      frameIdRef.current = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!frameIdRef.current && !reducedMotionRef.current) {
        frameIdRef.current = window.requestAnimationFrame(animate);
      }
    };

    startAnimationRef.current = startAnimation;
    startAnimation();
    window.addEventListener("resize", startAnimation, { passive: true });
    window.addEventListener("public-site-data:loaded", startAnimation, { passive: true });

    return () => {
      window.removeEventListener("resize", startAnimation);
      window.removeEventListener("public-site-data:loaded", startAnimation);
      if (frameIdRef.current) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [applyState, resolveTarget]);

  const doorOpen = useBootReveal();
  const [coreRevealed, setCoreRevealed] = useState(false);
  const [entranceSettled, setEntranceSettled] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!doorOpen || coreRevealed) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCoreRevealed(true);
      return;
    }

    const revealTimer = window.setTimeout(() => setCoreRevealed(true), 0);
    return () => window.clearTimeout(revealTimer);
  }, [doorOpen, coreRevealed]);

  useEffect(() => {
    if (!coreRevealed || entranceSettled) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settleTimer = window.setTimeout(
      () => {
        const target = resolveTarget();
        targetStateRef.current = target;
        animatedStateRef.current = target;
        applyState(target);
        startAnimationRef.current();
        setEntranceSettled(true);
      },
      reduced ? 0 : 1200
    );

    return () => window.clearTimeout(settleTimer);
  }, [coreRevealed, entranceSettled, applyState, resolveTarget]);

  const initialState = initialStateRef.current;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed -inset-x-[18vw] -inset-y-[18vh] z-[5] overflow-visible will-change-[transform,opacity] [backface-visibility:hidden] [contain:layout_paint_style]"
      style={{
        opacity: initialState.opacity,
        transform: `translate3d(${initialState.x}%, ${initialState.y}%, 0)`,
      }}
    >
      <div
        ref={revealRef}
        className={`command-core-reveal absolute inset-0 ${coreRevealed ? "opacity-100" : "opacity-0"}`}
        style={{
          transform: entranceSettled
            ? undefined
            : coreRevealed
              ? "translate3d(0px, 0px, 0px) scale(1)"
              : CORE_START_TRANSFORM,
        }}
      >
        <CommandCore3D isActive={!prefersReducedMotion} coreStateRef={coreStateRef} />
      </div>
    </div>
  );
};

export default PersistentCommandCore;
