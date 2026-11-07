import { TransitionLink } from "@/components/TransitionLink";

export const Footer = () => {
  const firstPublishedYear = 2026;
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear > firstPublishedYear
    ? `${firstPublishedYear}-${currentYear}`
    : `${firstPublishedYear}`;

  return (
    <footer className="relative select-none border-t border-white/10 bg-background/[0.92] backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-7">
          <TransitionLink to="/" className="inline-flex items-center">
            <span className="font-mono text-lg font-bold tracking-[0.32em] text-primary md:text-xl">
              P A M O D
            </span>
          </TransitionLink>

          <p className="text-xs text-muted-foreground md:text-center">
            © {copyrightYears} Pamod Madubashana. All rights reserved.
          </p>

          <p className="text-sm text-muted-foreground md:text-right">
            Available for freelance opportunities.
          </p>
        </div>
      </div>
    </footer>
  );
};
