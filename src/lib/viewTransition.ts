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

const ENABLE_NATIVE_VIEW_TRANSITIONS = false;

export const runWithViewTransition = (update: () => void | Promise<void>) => {
  if (!ENABLE_NATIVE_VIEW_TRANSITIONS || !supportsViewTransition() || prefersReducedMotion()) {
    return update();
  }

  return document.startViewTransition!(update);
};

export const navigateWithTransition = (
  navigate: (to: To, options?: NavigateOptions) => void,
  to: To,
  options?: NavigateOptions,
) => runWithViewTransition(() => navigate(to, options));
