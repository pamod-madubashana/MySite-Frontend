import { startTransition } from "react";
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
) => {
  // React 18 transition: if the target route suspends (lazy chunk), the current
  // page stays visible until the new one is ready instead of flashing the fallback.
  startTransition(() => {
    runWithViewTransition(() => navigate(to, options));
  });
};
