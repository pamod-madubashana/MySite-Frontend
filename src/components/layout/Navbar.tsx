import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ContactSection } from "@/components/sections/ContactSection";
import { ActivePill } from "@/components/layout/ActivePill";
import { BottomNav } from "@/components/layout/BottomNav";
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
  const desktopNavRef = useRef<HTMLUListElement>(null);

  const pathActiveId = location.pathname.startsWith("/projects")
    ? "/projects"
    : location.pathname.startsWith("/articles")
    ? "/articles"
    : location.pathname.startsWith("/about")
    ? "/about"
    : "/";
  const bottomActiveId = isContactModalOpen ? "contact" : pathActiveId;

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
  
  // Safety net: enable backdrop blur even if the CSS entrance never reports completion
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setNavReady(true), 1600);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
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
          <ul
            ref={desktopNavRef}
            className="relative hidden md:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            <ActivePill
              containerRef={desktopNavRef}
              activeId={pathActiveId}
              variant="pill"
              fillClass="bg-primary"
              insetY={6}
            />
            {navLinks.map((link) => (
              <li key={link.path} className="relative list-none">
                <TransitionLink
                  to={link.path}
                  data-nav-item={link.path}
                  aria-current={pathActiveId === link.path ? "page" : undefined}
                  className={`relative z-10 block min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    pathActiveId === link.path
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
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
        </div>
      </div>

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

    <BottomNav
      activeId={bottomActiveId}
      showContact={settings?.siteSections.showContact !== false}
      onContact={(element) =>
        openContactModal(getContactDialogOrigin(element))
      }
    />
    </>
  );
};
