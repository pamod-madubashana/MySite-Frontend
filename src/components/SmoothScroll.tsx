import { useEffect } from "react";
import Lenis from "lenis";

const SmoothScroll = () => {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      return;
    }

    let lenis: Lenis | null = null;
    let frameId = 0;

    try {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frameId = requestAnimationFrame(raf);
      };
      frameId = requestAnimationFrame(raf);
    } catch {
      lenis = null;
    }

    return () => {
      cancelAnimationFrame(frameId);
      lenis?.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;
