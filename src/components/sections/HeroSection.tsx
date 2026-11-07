import { Activity, Database, Server, Shield, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/TransitionLink";

const systemStats = [
  { label: "Deployments", value: "1,245", progress: "75%" },
  { label: "Uptime", value: "99.9%", progress: "99%" },
  { label: "Latency", value: "42ms", progress: "62%" },
];

export const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-[100svh] overflow-hidden px-4 pb-10 pt-16 md:min-h-[820px] md:pb-12 md:pt-24"
    >
      <div className="container relative z-20 mx-auto flex min-h-[calc(100svh-4rem)] items-end pb-10 pt-[42vh] md:min-h-[700px] md:items-center md:pb-0 md:pt-0">
        <div className="w-full max-w-[430px] space-y-4 md:max-w-[470px] md:space-y-5">
          <div className="space-y-2.5 md:space-y-3">
            <span className="section-pill mb-2">WELCOME TO MY DIGITAL SANCTUARY</span>
            <h1 className="text-[2.35rem] font-bold leading-[0.92] tracking-normal text-foreground drop-shadow-2xl min-[390px]:text-[2.55rem] sm:text-5xl md:text-[3.9rem] lg:text-[4.6rem]">
              Hi, I&apos;m Pamod
            </h1>
            <p className="max-w-md text-[0.95rem] font-bold leading-snug text-primary min-[390px]:text-base sm:text-lg md:text-xl">
              Developer / Automation Builder / Self-Hosting Enthusiast
            </p>
          </div>

          <p className="max-w-md rounded-lg border border-white/10 bg-background/50 p-3.5 text-[0.83rem] font-semibold leading-relaxed text-muted-foreground shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-md min-[390px]:text-sm md:p-4 md:text-[0.95rem]">
            I build bots, web apps, automation tools, and self-hosted systems with clean UI,
            practical workflows, and reliable deployments.
          </p>

          <div className="flex flex-wrap gap-3 pt-1 md:pt-2">
            <Button
              asChild
              size="sm"
              className="h-11 rounded-lg bg-primary px-5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.38)] transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 sm:px-6"
            >
              <TransitionLink to="/projects" className="inline-flex min-h-11 items-center justify-center gap-2">
                <span>View Projects</span>
              </TransitionLink>
            </Button>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-11 rounded-lg border-white/10 bg-white/[0.04] px-5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-foreground backdrop-blur-xl hover:border-primary/40 hover:bg-primary/10 hover:text-primary sm:px-6"
            >
              <TransitionLink to="/about" className="inline-flex min-h-11 items-center justify-center gap-2">
                <span>About Me</span>
              </TransitionLink>
            </Button>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-y-20 right-0 z-30 hidden w-[58%] md:block">
        <div className="hero-dashboard-overlay surface-card absolute right-[15%] top-[23%] w-64 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">System Metrics</span>
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.85)]" />
          </div>
          <div className="space-y-4">
            {systemStats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
                  <p className="font-mono text-xs font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: stat.progress }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card absolute left-[20%] top-[30%] flex h-20 w-20 rotate-[-12deg] items-center justify-center rounded-xl text-primary">
          <Terminal className="h-8 w-8" />
        </div>
        <div className="surface-card absolute bottom-[22%] right-[24%] flex h-16 w-16 rotate-12 items-center justify-center rounded-xl text-secondary">
          <Database className="h-7 w-7" />
        </div>
        <div className="surface-card absolute bottom-[30%] left-[18%] flex items-center gap-2 rounded-full px-4 py-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">CORE_STABLE</span>
        </div>
        <div className="surface-card absolute bottom-[11%] left-[28%] flex w-[420px] items-center justify-between rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Node Status</p>
              <p className="text-sm font-bold text-foreground">Production Ready</p>
            </div>
          </div>
          <Shield className="h-5 w-5 text-primary" />
        </div>
      </div>
    </section>
  );
};
