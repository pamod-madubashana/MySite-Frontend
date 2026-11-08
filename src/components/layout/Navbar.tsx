import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ContactSection } from "@/components/sections/ContactSection";
import { useSettings } from "@/contexts/SettingsContext";
import { TransitionLink } from "@/components/TransitionLink";
import { useIsMobile } from "@/hooks/use-mobile";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Articles", path: "/articles" },
];

interface ContactDialogOrigin {
  x: string;
  y: string;
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [navReady, setNavReady] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [contactDialogOrigin, setContactDialogOrigin] = useState<ContactDialogOrigin>({
    x: "50vw",
    y: "50vh",
  });
  const isMobile = useIsMobile();
  const location = useLocation();
  const { settings } = useSettings();
  const mobileMenuRef = useRef<HTMLUListElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const getContactDialogOrigin = (element: HTMLElement | null): ContactDialogOrigin => {
    if (!element) {
      return { x: "50vw", y: "50vh" };
    }

    const rect = element.getBoundingClientRect();
    return {
      x: `${rect.left + rect.width / 2}px`,
      y: `${rect.top + rect.height / 2}px`,
    };
  };

  const openContactModal = (origin: ContactDialogOrigin) => {
    setContactDialogOrigin(origin);
    setIsContactModalOpen(true);
  };

  const contactDialogStyle = isMobile
    ? undefined
    : ({
        "--contact-origin-x": contactDialogOrigin.x,
        "--contact-origin-y": contactDialogOrigin.y,
      } as CSSProperties);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Safety net: enable backdrop blur even if the CSS entrance never reports completion
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setNavReady(true), 1600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isOpen || !mobileMenuRef.current) {
      return;
    }

    const focusableSelectors =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableNodes = Array.from(mobileMenuRef.current.querySelectorAll<HTMLElement>(focusableSelectors));
    const firstNode = focusableNodes[0];
    const lastNode = focusableNodes[focusableNodes.length - 1];

    firstNode?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || focusableNodes.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode?.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <nav
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          setNavReady(true);
        }
      }}
      className="site-navbar pointer-events-none fixed inset-x-0 top-0 z-50 select-none"
    >
      <div className="pointer-events-auto relative mx-auto w-full md:max-w-[min(calc(100%_-_6rem),_80rem)]">
        <div
          aria-hidden
          className="navbar-shape hidden md:block absolute inset-0 rounded-b-[1rem] bg-foreground/[0.12]"
        />
        <div
          aria-hidden
          className={`navbar-shape absolute inset-px rounded-b-[1rem]${navReady ? " backdrop-blur-md" : ""}`}
          style={{ backgroundColor: "var(--glass-bg-strong)" }}
        />
        <div className="navbar-container transform3d relative mx-auto flex h-16 w-full items-center justify-between px-4 md:h-20 md:px-9">
          {/* Logo */}
          <TransitionLink to="/" className="group relative inline-flex min-h-11 items-center">
            <span className="whitespace-nowrap font-mono text-lg font-semibold uppercase tracking-[0.3em] text-primary md:text-xl">
              PAMOD
            </span>
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-[width] duration-300 group-hover:w-full" />
          </TransitionLink>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <li key={link.path} className="relative list-none">
                <TransitionLink
                  to={link.path}
                  className={`block min-h-11 px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </TransitionLink>
              </li>
            ))}
          </ul>

          {/* Contact CTA */}
          <div className="hidden md:flex items-center gap-4">
            {settings?.siteSections.showContact !== false && (
              <button
                type="button"
                className="block min-h-11 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
                onClick={(event) => openContactModal(getContactDialogOrigin(event.currentTarget))}
              >
                Contact
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-foreground md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.2
            }}
            className="pointer-events-auto overflow-hidden border-t border-white/10 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 md:hidden"
            style={{
              maxHeight: isOpen ? "300px" : "0",
              overflow: "hidden",
              transition: "max-height 0.25s ease-in-out"
            }}
          >
            <div className="container mx-auto px-4 py-4">
              <ul
                id="mobile-menu"
                ref={mobileMenuRef}
                aria-label="Mobile navigation"
                className="flex flex-col gap-2"
              >
                {navLinks.map((link) => (
                  <li key={link.path} className="w-full list-none">
                    <TransitionLink
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block min-h-11 w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-colors duration-150 ${
                        location.pathname === link.path
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                      }`}
                      aria-current={location.pathname === link.path ? "page" : undefined}
                    >
                    {link.name}
                  </TransitionLink>
                </li>
              ))}
              </ul>
              {settings?.siteSections.showContact !== false && (
                <button
                  type="button"
                  className="mt-2 block min-h-11 w-full rounded-lg px-4 py-3 text-left text-base font-medium text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.04] hover:text-foreground"
                  onClick={(event) => {
                    const origin = getContactDialogOrigin(event.currentTarget);
                    setIsOpen(false);
                    setTimeout(() => openContactModal(origin), 100);
                  }}
                >
                  Contact
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent
          style={contactDialogStyle}
          overlayClassName="bg-transparent backdrop-blur-[2px]"
          className="dark w-[95vw] max-w-5xl h-[90vh] p-0 border border-primary/25 bg-background/60 backdrop-blur-2xl shadow-2xl shadow-black/50 contact-dialog-content"
        >
          <div
            data-lenis-prevent
            className="h-full overflow-y-auto contact-modal-scroll bg-gradient-to-b from-background/55 to-background/70"
          >
            <ContactSection />
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};
