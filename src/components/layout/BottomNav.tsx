import { useRef } from "react";
import { House, User, FolderKanban, Newspaper, Mail } from "lucide-react";
import { ActivePill } from "@/components/layout/ActivePill";
import { TransitionLink } from "@/components/TransitionLink";

const tabs = [
  { id: "/", label: "Home", icon: House },
  { id: "/about", label: "About", icon: User },
  { id: "/projects", label: "Projects", icon: FolderKanban },
  { id: "/articles", label: "Articles", icon: Newspaper },
];

interface BottomNavProps {
  activeId: string;
  showContact: boolean;
  onContact: (element: HTMLElement) => void;
}

/**
 * Mobile-only bottom navigation (YouTube-style, icons only) with the
 * moorly morphing ActivePill indicator behind the active tab.
 */
export const BottomNav = ({ activeId, showContact, onContact }: BottomNavProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = showContact
    ? [...tabs, { id: "contact", label: "Contact", icon: Mail }]
    : tabs;

  return (
    <nav
      aria-label="Quick navigation"
      className="site-bottom-nav pointer-events-auto fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "calc(6px + env(safe-area-inset-bottom))" }}
    >
      <div
        ref={containerRef}
        className={`relative mx-auto grid h-14 w-full px-1 ${
          showContact ? "grid-cols-5" : "grid-cols-4"
        }`}
      >
        <ActivePill
          containerRef={containerRef}
          activeId={activeId}
          fillClass="bg-primary"
        />
        {items.map((tab) => {
          const active = activeId === tab.id;
          const className = `relative z-10 flex h-14 flex-col items-center justify-center transition-colors duration-150 ${
            active ? "text-primary-foreground" : "text-muted-foreground"
          }`;

          if (tab.id === "contact") {
            return (
              <button
                key="contact"
                type="button"
                data-nav-item="contact"
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className={className}
                onClick={(event) => onContact(event.currentTarget)}
              >
                <Mail className="h-5 w-5" strokeWidth={2} />
              </button>
            );
          }

          return (
            <TransitionLink
              key={tab.id}
              to={tab.id}
              data-nav-item={tab.id}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              <tab.icon className="h-5 w-5" strokeWidth={2} />
            </TransitionLink>
          );
        })}
      </div>
    </nav>
  );
};
