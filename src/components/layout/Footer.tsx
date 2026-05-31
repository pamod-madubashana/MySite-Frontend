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
    <footer className="relative select-none border-t border-white/10 bg-background/80 backdrop-blur-2xl">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.04)_1px,transparent_1px)] bg-[size:54px_54px] opacity-25" />

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-3">
            <TransitionLink to="/" className="inline-flex items-center">
              <span className="font-mono text-xl font-black tracking-[0.34em] text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.35)] md:text-2xl">
                P A M O D
              </span>
            </TransitionLink>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Developer, automation builder, and self-hosting enthusiast building practical systems for the neural grid.
            </p>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary md:text-sm">
              Quick Links
            </span>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label="Footer links">
              {footerLinks.map((link) => (
                <TransitionLink
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center py-1 font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-200 hover:text-primary"
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/90">
              Available for freelance opportunities
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1">
            (c) {copyrightYears} Pamod Madubashana. Built for the neural grid.
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
