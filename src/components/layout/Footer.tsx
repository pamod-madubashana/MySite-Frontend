import { Github, Linkedin, Mail, Send, type LucideIcon } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { TransitionLink } from "@/components/TransitionLink";



const footerLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Articles", path: "/articles" },
];

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

export const Footer = () => {
  const firstPublishedYear = 2026;
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > firstPublishedYear
    ? `${firstPublishedYear}-${currentYear}`
    : `${firstPublishedYear}`;
  const { settings } = useSettings();

  const socialLinks: SocialLink[] = settings?.socialLinks ? [
    settings.socialLinks.github ? {
      icon: Github,
      href: settings.socialLinks.github,
      label: "GitHub"
    } : null,
    settings.socialLinks.linkedin ? {
      icon: Linkedin,
      href: settings.socialLinks.linkedin,
      label: "LinkedIn"
    } : null,
    settings.socialLinks.telegram ? {
      icon: Send,
      href: settings.socialLinks.telegram,
      label: "Telegram"
    } : null,
    settings.socialLinks.email ? {
      icon: Mail,
      href: `mailto:${settings.socialLinks.email}`,
      label: "Email"
    } : null
  ].filter((social): social is SocialLink => Boolean(social)) : [
    { icon: Github, href: "https://github.com/pamod-madubashana", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/pamod-madubashana-886b621a2", label: "LinkedIn" },
    { icon: Send, href: "https://t.me/pamod_madubashana", label: "Telegram" },
    { icon: Mail, href: "mailto:contact@pamod.is-a.dev", label: "Email" }
  ];

  return (
    <footer className="relative select-none border-t border-border/80 bg-card/40 backdrop-blur-sm">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-60" />

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-3">
            <TransitionLink to="/" className="inline-flex items-center">
              <span className="text-xl font-bold tracking-[0.24em] text-foreground/80 md:text-2xl">
                P A M O D
              </span>
            </TransitionLink>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Full-stack developer crafting performant, scalable products with thoughtful UI and reliable architecture.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90">
              Quick Links
            </span>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label="Footer links">
              {footerLinks.map((link) => (
                <TransitionLink
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center py-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.name}
                </TransitionLink>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
              Available for freelance opportunities
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1">
            © {copyrightYears} Pamod Madubashana. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <TransitionLink
              to="/privacy"
              className="inline-flex items-center py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </TransitionLink>
            <TransitionLink
              to="/terms"
              className="inline-flex items-center py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </TransitionLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
