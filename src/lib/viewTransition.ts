import { NavigateOptions, To } from "react-router-dom";

declare global {
  interface Document {
    startViewTransition?: (updateCallback: () => void | Promise<void>) => { finished: Promise<void> };
  }
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const supportsViewTransition = () =>
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

export const runWithViewTransition = (update: () => void | Promise<void>) => {
  if (!supportsViewTransition() || prefersReducedMotion()) {
    return update();
  }

  return document.startViewTransition!(update);
};

export const navigateWithTransition = (
  navigate: (to: To, options?: NavigateOptions) => void,
  to: To,
  options?: NavigateOptions,
) => runWithViewTransition(() => navigate(to, options));
