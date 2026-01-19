import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop Component
// Automatically scrolls to top when route changes, handles hash navigation
const ScrollToTop = () => {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);
  const previousHash = useRef(location.hash);

  useEffect(() => {
    // Handle pathname changes
    const pathnameChanged = previousPathname.current !== location.pathname;
    
    if (pathnameChanged) {
      // Scroll to top instantly to avoid interfering with any smooth scrolling
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      
      // Update ref to track the new pathname
      previousPathname.current = location.pathname;
    }
    
    // Handle hash changes (for anchor links like /#contact)
    const hashChanged = previousHash.current !== location.hash;
    
    if (hashChanged && location.hash) {
      // Wait a bit for DOM to render, then scroll to the element
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
      
      // Update ref to track the new hash
      previousHash.current = location.hash;
    }
  }, [location.pathname, location.hash]);

  // This component renders nothing
  return null;
};

export default ScrollToTop;