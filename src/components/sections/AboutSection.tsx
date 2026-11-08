import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const AboutSection = () => {
  const isMobile = useIsMobile();
  const shouldAnimate = !isMobile;
  const revealViewport = { once: true, amount: 0.2, margin: "0px 0px -64px 0px" };

  const fadeUp = (delay = 0) => ({
    initial: shouldAnimate ? { opacity: 0, y: 8 } : false,
    whileInView: shouldAnimate ? { opacity: 1, y: 0 } : undefined,
    viewport: shouldAnimate ? revealViewport : undefined,
    transition: shouldAnimate ? { duration: 0.4, delay, ease: EASE } : undefined,
  });

  return (
    <section id="about" className="section-shell">
      <div className="section-inner">
        <motion.div {...fadeUp()} className="mx-auto mb-12 max-w-3xl text-center">
          <span className="section-pill">About me</span>
          <h2 className="section-title">Web apps, automation, self-hosted systems</h2>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            I connect high-performance backends, practical automation, and sharp interfaces into
            systems that feel fast, useful, and resilient.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.05)}
          className="mx-auto max-w-3xl space-y-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          <p>
            My work lives at the intersection of web apps, Telegram automation, backend services,
            and self-hosted infrastructure.
          </p>
          <p>
            I like systems that are independent, observable, and easy to ship: Dockerized services,
            clean APIs, useful dashboards, and UI that makes operations feel calm.
          </p>
          <p>
            AI-assisted development helps me move from idea to production faster while keeping the
            architecture readable and maintainable.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
