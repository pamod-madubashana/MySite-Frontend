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

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pieces = Array.from(svg.querySelectorAll("path"));
    let setupFrame = 0;
    let renderFrame = 0;
    let pendingPiece: SVGPathElement | null = null;
    let hasPending = false;
    let lastApplied: SVGPathElement | null = null;
    let currentTilt: Point = { x: 0, y: 0 };
    let targetTilt: Point = { x: 0, y: 0 };

    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    pieces.forEach((piece) => {
      piece.style.setProperty("--move-x", "0px");
      piece.style.setProperty("--move-y", "0px");
    });

    // Per-piece outward offset for the subtle "breathing" on hover. Measured
    // once per enter/resize so pointermove never has to read layout.
    const measure = () => {
      const svgRect = svg.getBoundingClientRect();
      const centerX = svgRect.left + svgRect.width / 2;
      const centerY = svgRect.top + svgRect.height / 2;

      pieces.forEach((piece, index) => {
        const rect = piece.getBoundingClientRect();
        let dx = rect.left + rect.width / 2 - centerX;
        let dy = rect.top + rect.height / 2 - centerY;
        const length = Math.hypot(dx, dy) || 1;
        const amount = 3.4 + (index % 9) * 0.28;
        dx /= length;
        dy /= length;
        piece.style.setProperty("--move-x", `${(dx * amount).toFixed(2)}px`);
        piece.style.setProperty("--move-y", `${(dy * amount).toFixed(2)}px`);
      });
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(setupFrame);
      setupFrame = requestAnimationFrame(measure);
    };

    // Single rAF loop drives the highlight + eased tilt, so bursts of
    // pointermove events coalesce into one update per frame.
    const render = () => {
      renderFrame = 0;

      if (hasPending) {
        hasPending = false;
        // Only the piece under the cursor lights up. When it changes (or the
        // pointer leaves -> null) we drop the class from the previous one; the
        // slow base CSS transition then lets its glow linger and fade on its own.
        if (pendingPiece !== lastApplied) {
          lastApplied?.classList.remove("active-piece");
          pendingPiece?.classList.add("active-piece");
          lastApplied = pendingPiece;
        }
      }

      currentTilt = {
        x: currentTilt.x + (targetTilt.x - currentTilt.x) * TILT_DAMPING,
        y: currentTilt.y + (targetTilt.y - currentTilt.y) * TILT_DAMPING,
      };
      portrait.style.transform = `rotateX(${currentTilt.y.toFixed(3)}deg) rotateY(${currentTilt.x.toFixed(3)}deg)`;

      if (Math.abs(targetTilt.x - currentTilt.x) > 0.01 || Math.abs(targetTilt.y - currentTilt.y) > 0.01) {
        schedule();
      }
    };

    const schedule = () => {
      if (!renderFrame) {
        renderFrame = requestAnimationFrame(render);
      }
    };

    const handlePointerEnter = () => {
      scheduleMeasure();
      portrait.classList.add("is-active");
    };

    const handlePointerLeave = () => {
      portrait.classList.remove("is-active");
      pendingPiece = null;
      hasPending = true;
      targetTilt = { x: 0, y: 0 };
      schedule();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pendingPiece = event.target instanceof window.SVGPathElement ? event.target : null;
      hasPending = true;

      if (!prefersReducedMotion) {
        const rect = portrait.getBoundingClientRect();
        targetTilt = {
          x: clampTilt((event.clientX - (rect.left + rect.width / 2)) * 0.009),
          y: clampTilt(-(event.clientY - (rect.top + rect.height / 2)) * 0.009),
        };
      }

      schedule();
    };

    portrait.addEventListener("pointerenter", handlePointerEnter);
    portrait.addEventListener("pointerleave", handlePointerLeave);
    portrait.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", scheduleMeasure);

    scheduleMeasure();

    return () => {
      cancelAnimationFrame(setupFrame);
      cancelAnimationFrame(renderFrame);
      portrait.removeEventListener("pointerenter", handlePointerEnter);
      portrait.removeEventListener("pointerleave", handlePointerLeave);
      portrait.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", scheduleMeasure);
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

        .about-hover-portrait svg path {
          --move-x: 0px;
          --move-y: 0px;
          cursor: pointer;
          transform-box: fill-box;
          transform-origin: center;
          /* Base = the slow fade-OUT once .active-piece is removed, so the
             highlight lingers and drifts back instead of snapping off. */
          transition:
            transform 900ms cubic-bezier(.62, 1, .36, 1),
            filter 900ms ease,
            opacity 900ms ease;
          will-change: transform, opacity, filter;
        }

        .about-hover-portrait.is-active svg path {
          transform: translate(calc(var(--move-x) * .32), calc(var(--move-y) * .32));
        }

        /* Only the hovered piece reacts — no neighbour highlighting. Its own
           transition is fast, so it lights up quickly then fades out slowly via
           the base rule above. */
        .about-hover-portrait svg path.active-piece {
          transition:
            transform 150ms ease-out,
            filter 150ms ease-out,
            opacity 150ms ease-out;
          opacity: 1;
          transform:
            translate(calc(var(--move-x) * .55), calc(var(--move-y) * .55))
            scale(1.03);
          filter:
            brightness(1.1)
            drop-shadow(0 0 6px hsl(var(--primary) / .5));
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
