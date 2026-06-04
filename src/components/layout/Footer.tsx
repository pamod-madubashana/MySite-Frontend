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
    <footer className="relative select-none border-t border-white/10 bg-background/92 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-7 md:py-8">
        <div className="grid gap-7 md:grid-cols-[1.2fr_auto_1fr] md:items-start">
          <div className="max-w-sm space-y-3">
            <TransitionLink to="/" className="inline-flex items-center">
              <span className="font-mono text-lg font-black tracking-[0.32em] text-primary md:text-xl">
                P A M O D
              </span>
            </TransitionLink>
            <p className="text-sm leading-6 text-muted-foreground">
              Developer, automation builder, and self-hosting enthusiast building practical web systems and reliable workflows.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-center" aria-label="Footer links">
              {footerLinks.map((link) => (
                <TransitionLink
                  key={link.path}
                  to={link.path}
                className="inline-flex items-center py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.name}
                </TransitionLink>
              ))}
          </nav>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex items-center gap-2 md:justify-end">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.035] text-muted-foreground transition-colors duration-200 hover:border-primary/45 hover:bg-primary/10 hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground md:text-right">
              Available for freelance opportunities.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {copyrightYears} Pamod Madubashana. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
