import { Github, Linkedin, Send, Mail, Heart } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { TransitionLink } from "@/components/TransitionLink";



const footerLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Articles", path: "/articles" },
];

export const Footer = () => {
  const firstPublishedYear = 2026;
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > firstPublishedYear
    ? `${firstPublishedYear}-${currentYear}`
    : `${firstPublishedYear}`;
  const { settings } = useSettings();
  
  const socialLinks = settings?.socialLinks ? [
    settings.socialLinks.github && { 
      icon: Github, 
      href: settings.socialLinks.github, 
      label: "GitHub" 
    },
    settings.socialLinks.linkedin && { 
      icon: Linkedin, 
      href: settings.socialLinks.linkedin, 
      label: "LinkedIn" 
    },
    settings.socialLinks.telegram && { 
      icon: Send, 
      href: settings.socialLinks.telegram, 
      label: "Telegram" 
    },
    settings.socialLinks.email && { 
      icon: Mail, 
      href: `mailto:${settings.socialLinks.email}`, 
      label: "Email" 
    }
  ].filter(Boolean) as Array<{icon: React.FC<any>, href: string, label: string}> : [
    { icon: Github, href: "https://github.com/pamod-madubashana", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/pamod-madubashana-886b621a2", label: "LinkedIn" },
    { icon: Send, href: "https://t.me/pamod_madubashana", label: "Telegram" },
    { icon: Mail, href: "mailto:contact@pamod.is-a.dev", label: "Email" }
  ];

  return (
    <footer className="relative border-t border-border bg-card/50 backdrop-blur-sm select-none">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <TransitionLink to="/" className="inline-flex min-h-11 items-center">
              <span className="text-2xl font-bold text-foreground/70">
                P A M O D
              </span>
            </TransitionLink>
            <p className="text-sm text-muted-foreground max-w-xs">
              Building the future, one line of code at a time. Full-stack developer passionate about creating beautiful digital experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2" aria-label="Footer links">
              {footerLinks.map((link) => (
                <TransitionLink
                  key={link.path}
                  to={link.path}
                  className="inline-flex min-h-11 items-center text-base text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.name}
                </TransitionLink>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Available for freelance opportunities
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {copyrightYears} Pamod Madubashana. All rights reserved.
          </p>
          <div className="flex gap-4">
            <TransitionLink
              to="/privacy"
              className="inline-flex min-h-11 items-center text-base text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </TransitionLink>
            <TransitionLink
              to="/terms"
              className="inline-flex min-h-11 items-center text-base text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </TransitionLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
