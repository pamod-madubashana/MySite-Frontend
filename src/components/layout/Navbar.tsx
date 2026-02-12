import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Linkedin, Send, Mail, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ContactSection } from "@/components/sections/ContactSection";
import { useSettings } from "@/contexts/SettingsContext";
import { TransitionLink } from "@/components/TransitionLink";
import { navigateWithTransition } from "@/lib/viewTransition";
import { useIsMobile } from "@/hooks/use-mobile";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Articles", path: "/articles" },
];

// Social link icons mapping
const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  telegram: Send,
  email: Mail
};

interface ContactDialogOrigin {
  x: string;
  y: string;
}

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactDialogOrigin, setContactDialogOrigin] = useState<ContactDialogOrigin>({
    x: "50vw",
    y: "50vh",
  });
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
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
  
  // Generate social links from settings, fallback to defaults if not loaded
  const socialLinks: SocialLink[] = settings?.socialLinks ? [
    settings.socialLinks.github ? {
      icon: socialIcons.github,
      href: settings.socialLinks.github,
      label: "GitHub"
    } : null,
    settings.socialLinks.linkedin ? {
      icon: socialIcons.linkedin,
      href: settings.socialLinks.linkedin,
      label: "LinkedIn"
    } : null,
    settings.socialLinks.telegram ? {
      icon: socialIcons.telegram,
      href: settings.socialLinks.telegram,
      label: "Telegram"
    } : null,
    settings.socialLinks.email ? {
      icon: socialIcons.email,
      href: `mailto:${settings.socialLinks.email}`,
      label: "Email"
    } : null
  ].filter((social): social is SocialLink => Boolean(social)) : [
    { icon: socialIcons.github, href: "https://github.com/pamod-madubashana", label: "GitHub" },
    { icon: socialIcons.linkedin, href: "https://www.linkedin.com/in/pamod-madubashana-886b621a2", label: "LinkedIn" },
    { icon: socialIcons.telegram, href: "https://t.me/pamod_madubashana", label: "Telegram" },
    { icon: socialIcons.email, href: "mailto:contact@pamod.is-a.dev", label: "Email" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Debounce scroll handler to prevent jank
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    
    // Also close mobile menu when route changes
    setIsOpen(false);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

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

  const handleNavigate = (path: string) => {
    navigateWithTransition(navigate, path);
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={false}
      animate={{ 
        y: 0,
        backgroundColor: scrolled ? "var(--glass-bg-strong)" : "transparent"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 25,
        mass: 0.5
      }}
      className={`site-navbar fixed top-0 left-0 right-0 z-50 select-none ${
        scrolled
          ? "glass-strong shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 navbar-container transform3d">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <TransitionLink to="/" className="relative group min-h-11 inline-flex items-center">
            <span className="text-xl md:text-2xl font-bold text-foreground/70">
              P A M O D
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </TransitionLink>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <motion.li
                key={link.path}
                className="relative list-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TransitionLink
                  to={link.path}
                  className={`block min-h-11 px-4 py-2 text-base font-medium transition-colors duration-200 ${
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
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </TransitionLink>
              </motion.li>
            ))}
          </ul>

          {/* Social Links & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {settings?.siteSections.showContact !== false && (
              <Button
                variant="default"
                size="sm"
                className="neon-glow min-h-11"
                onClick={(event) => openContactModal(getContactDialogOrigin(event.currentTarget))}
              >
                Contact
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground"
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
            className="md:hidden overflow-hidden border-t border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/98 backdrop-blur-xl"
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
                role="menu"
                aria-label="Mobile navigation"
                className="flex flex-col gap-2"
              >
                {navLinks.map((link) => (
                  <motion.li
                    key={link.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full list-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigate(link.path)}
                      className={`block min-h-11 w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-colors duration-200 ${
                        location.pathname === link.path
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      role="menuitem"
                    >
                    {link.name}
                  </button>
                </motion.li>
              ))}
              </ul>
              {settings?.siteSections.showContact !== false && (
                <Button
                  variant="default"
                  className="mt-4 neon-glow min-h-11 w-full"
                  onClick={(event) => {
                    const origin = getContactDialogOrigin(event.currentTarget);
                    setIsOpen(false);
                    setTimeout(() => openContactModal(origin), 100);
                  }}
                >
                  Contact
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent
          style={contactDialogStyle}
          overlayClassName="bg-transparent backdrop-blur-[2px]"
          className="dark w-[95vw] max-w-5xl h-[90vh] p-0 border border-border/60 bg-background/60 backdrop-blur-2xl shadow-2xl shadow-black/50 contact-dialog-content"
        >
          <div className="h-full overflow-y-auto contact-modal-scroll bg-gradient-to-b from-background/55 to-background/70">
            <ContactSection />
          </div>
        </DialogContent>
      </Dialog>
    </motion.nav>
  );
};
