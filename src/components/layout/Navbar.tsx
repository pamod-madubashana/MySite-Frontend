import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Linkedin, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

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

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  
  // Generate social links from settings, fallback to defaults if not loaded
  const socialLinks = settings?.socialLinks ? [
    settings.socialLinks.github && { 
      icon: socialIcons.github, 
      href: settings.socialLinks.github, 
      label: "GitHub" 
    },
    settings.socialLinks.linkedin && { 
      icon: socialIcons.linkedin, 
      href: settings.socialLinks.linkedin, 
      label: "LinkedIn" 
    },
    settings.socialLinks.telegram && { 
      icon: socialIcons.telegram, 
      href: settings.socialLinks.telegram, 
      label: "Telegram" 
    },
    settings.socialLinks.email && { 
      icon: socialIcons.email, 
      href: `mailto:${settings.socialLinks.email}`, 
      label: "Email" 
    }
  ].filter(Boolean) as Array<{icon: React.FC<any>, href: string, label: string}> : [
    { icon: socialIcons.github, href: "https://github.com/pamod-madubashana", label: "GitHub" },
    { icon: socialIcons.linkedin, href: "https://www.linkedin.com/in/pamod-madubashana-886b621a2", label: "LinkedIn" },
    { icon: socialIcons.telegram, href: "https://t.me/pamod_madubashana", label: "Telegram" },
    { icon: socialIcons.email, href: "mailto:pamod.main@gmail.com", label: "Email" }
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
      className={`fixed top-0 left-0 right-0 z-50 ${
        scrolled
          ? "glass-strong shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 navbar-container transform3d">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="relative group">
            <span className="text-xl md:text-2xl font-bold text-foreground/70">
              P A M O D
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.div
                key={link.path}
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.path}
                  className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
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
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Social Links & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* Only show contact button if contact section is enabled */}
            {settings?.siteSections.showContact && (
              <button 
                onClick={() => {
                  // First try hash navigation
                  const contactElement = document.getElementById('contact');
                  if (contactElement) {
                    contactElement.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  } else {
                    // Fallback: navigate to home with hash
                    window.location.hash = 'contact';
                  }
                }}
                className="neon-glow"
              >
                <Button variant="default" size="sm" className="neon-glow">
                  Contact
                </Button>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
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
            className="md:hidden glass-strong border-t border-border overflow-hidden"
            style={{
              maxHeight: isOpen ? "300px" : "0",
              overflow: "hidden",
              transition: "max-height 0.25s ease-in-out"
            }}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Link
                      to={link.path}
                      onClick={() => {
                        // Close menu with slight delay for better UX
                        setTimeout(() => setIsOpen(false), 150);
                      }}
                      className={`block w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                        location.pathname === link.path
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              {/* Only show contact button if contact section is enabled */}
              {settings?.siteSections.showContact && (
                <button 
                  onClick={() => {
                    // Close menu first
                    setTimeout(() => setIsOpen(false), 150);
                    // Then scroll to contact
                    setTimeout(() => {
                      const contactElement = document.getElementById('contact');
                      if (contactElement) {
                        contactElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      } else {
                        // Fallback
                        window.location.hash = 'contact';
                      }
                    }, 200);
                  }}
                  className="w-full"
                >
                  <Button variant="default" className="mt-4 neon-glow w-full">
                    Contact
                  </Button>
                </button>
              )}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
