// Shared lazy-route loaders so hover prefetch and App's lazy() resolve the
// same chunks (Vite dedupes identical import specifiers into one module).
const routeLoaders: Array<[pattern: RegExp, load: () => Promise<unknown>]> = [
  [/^\/about\/?$/, () => import("@/pages/About")],
  [/^\/projects\/[^/]+\/?$/, () => import("@/pages/ProjectDetail")],
  [/^\/projects\/?$/, () => import("@/pages/Projects")],
  [/^\/articles\/?$/, () => import("@/pages/Articles")],
];

export const prefetchRoute = (to: string) => {
  const pathname = to.split(/[?#]/)[0];
  const entry = routeLoaders.find(([pattern]) => pattern.test(pathname));

  if (entry) {
    entry[1]().catch(() => undefined);
  }
};
