import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop Component
// Automatically scrolls to top when route changes, handles hash navigation
const ScrollToTop = () => {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const previousHash = useRef(location.hash);

  useEffect(() => {
    const pathnameChanged = previousPathname.current !== location.pathname;
    const hashChanged = previousHash.current !== location.hash;
    const hasHash = Boolean(location.hash);

    if (pathnameChanged && !hasHash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }

    if ((hashChanged || pathnameChanged) && hasHash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }

    previousPathname.current = location.pathname;
    previousHash.current = location.hash;
  }, [location.pathname, location.hash]);

  // This component renders nothing
  return null;
};

export default ScrollToTop;
