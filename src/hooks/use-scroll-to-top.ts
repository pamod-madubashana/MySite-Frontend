import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to manage scroll behavior in React Router applications
 * Handles automatic scrolling to top on route changes while preserving scroll on refresh
 */
export const useScrollToTop = () => {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    // Check if pathname actually changed (not just hash/search params)
    const pathnameChanged = previousPathname.current !== location.pathname;
    
    if (pathnameChanged) {
      // Scroll to top when navigating to a new route
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Use instant to avoid smooth scroll interference
      });
      
      // Update the ref to current pathname
      previousPathname.current = location.pathname;
    }
    
    // Cleanup function (optional, but good practice)
    return () => {
      // Any cleanup if needed
    };
  }, [location.pathname]); // Only depend on pathname changes

  // Return current pathname for potential external use
  return {
    currentPathname: location.pathname,
    previousPathname: previousPathname.current
  };
};

export default useScrollToTop;