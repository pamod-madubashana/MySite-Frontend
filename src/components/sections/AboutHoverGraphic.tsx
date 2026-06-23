import { useEffect, useRef } from "react";
import portraitSvg from "@/assets/about-low-poly-portrait.svg?raw";

type Point = {
  x: number;
  y: number;
};

const TILT_DAMPING = 0.12;
const clampTilt = (value: number) => Math.max(-5.5, Math.min(5.5, value));

export const AboutHoverGraphic = () => {
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const portrait = portraitRef.current;
    const svg = portrait?.querySelector("svg");

    if (!portrait || !svg) {
      return undefined;
    }

    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    // The per-triangle highlight is pure CSS (:hover below). JS only adds the
    // subtle eased 3D tilt that follows the cursor.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let frame = 0;
    let current: Point = { x: 0, y: 0 };
    let target: Point = { x: 0, y: 0 };

    const render = () => {
      frame = 0;
      current = {
        x: current.x + (target.x - current.x) * TILT_DAMPING,
        y: current.y + (target.y - current.y) * TILT_DAMPING,
      };
      portrait.style.transform = `rotateX(${current.y.toFixed(3)}deg) rotateY(${current.x.toFixed(3)}deg)`;

      if (Math.abs(target.x - current.x) > 0.01 || Math.abs(target.y - current.y) > 0.01) {
        schedule();
      }
    };

    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = portrait.getBoundingClientRect();
      target = {
        x: clampTilt((event.clientX - (rect.left + rect.width / 2)) * 0.009),
        y: clampTilt(-(event.clientY - (rect.top + rect.height / 2)) * 0.009),
      };
      schedule();
    };

    const handlePointerLeave = () => {
      target = { x: 0, y: 0 };
      schedule();
    };

    portrait.addEventListener("pointermove", handlePointerMove);
    portrait.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      portrait.removeEventListener("pointermove", handlePointerMove);
      portrait.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      className="about-hover-stage mx-auto w-full max-w-[520px]"
      role="img"
      aria-label="Low-poly portrait of Pamod Madubashana"
    >
      <div
        ref={portraitRef}
        className="about-hover-portrait"
        dangerouslySetInnerHTML={{ __html: portraitSvg }}
      />

      <style>{`
        .about-hover-stage {
          perspective: 1100px;
        }

        .about-hover-portrait {
          display: grid;
          place-items: center;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .about-hover-portrait svg {
          display: block;
          height: auto;
          max-height: min(68vh, 620px);
          overflow: visible;
          width: 100%;
          filter: drop-shadow(0 28px 44px hsl(var(--primary) / 0.16));
        }

        /* Per-triangle hover (iamschulz.com style): the base rule is the slow,
           delayed fade-OUT, so a swept piece lingers then drifts back like a
           comet trail. */
        .about-hover-portrait svg path {
          cursor: pointer;
          transition:
            fill 1s ease-out 1s,
            filter 1s ease-out;
        }

        /* :hover snaps the colour on instantly (transition: none); the
           hue-rotate + brightness flash is what gives iamschulz its vivid pop. */
        .about-hover-portrait svg path:hover {
          fill: hsl(var(--primary));
          filter: hue-rotate(-140deg) brightness(1.8);
          transition: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-hover-portrait,
          .about-hover-portrait svg path {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};
