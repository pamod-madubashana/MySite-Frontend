import { Github, Linkedin, Send, Mail, type LucideIcon } from "lucide-react";
import { TransitionLink } from "@/components/TransitionLink";
import { useSettings } from "@/contexts/SettingsContext";

// Social link icons mapping
const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  telegram: Send,
  email: Mail
};

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

  return (
    <footer className="relative select-none border-t border-white/10 bg-background/[0.92] backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-7">
          <TransitionLink to="/" className="inline-flex items-center">
            <span className="font-mono text-lg font-semibold tracking-[0.3em] text-primary md:text-xl">
              PAMOD
            </span>
          </TransitionLink>

          <p className="text-xs text-muted-foreground md:text-center">
            © {copyrightYears} Pamod Madubashana. All rights reserved.
          </p>

          <div className="flex items-center justify-start gap-1 md:justify-end">
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
        </div>
      </div>
    </footer>
  );
};
