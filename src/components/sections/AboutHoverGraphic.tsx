import { useEffect, useRef } from "react";
import portraitSvg from "@/assets/about-low-poly-portrait.svg?raw";

type Point = {
  x: number;
  y: number;
};

const TILT_DAMPING = 0.12;

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
    let tiltFrame = 0;
    let currentTilt: Point = { x: 0, y: 0 };
    let targetTilt: Point = { x: 0, y: 0 };

    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    pieces.forEach((piece) => {
      piece.style.setProperty("--move-x", "0px");
      piece.style.setProperty("--move-y", "0px");
    });

    const boxCenter = (element: SVGPathElement) => {
      const rect = element.getBoundingClientRect();

      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
      };
    };

    const setupMovement = () => {
      const svgRect = svg.getBoundingClientRect();
      const centerX = svgRect.left + svgRect.width / 2;
      const centerY = svgRect.top + svgRect.height / 2;

      pieces.forEach((piece, index) => {
        const center = boxCenter(piece);
        let dx = center.x - centerX;
        let dy = center.y - centerY;
        const length = Math.hypot(dx, dy) || 1;
        const amount = 3.4 + (index % 9) * 0.28;

        dx /= length;
        dy /= length;

        piece.style.setProperty("--move-x", `${(dx * amount).toFixed(2)}px`);
        piece.style.setProperty("--move-y", `${(dy * amount).toFixed(2)}px`);
      });
    };

    const scheduleSetupMovement = () => {
      cancelAnimationFrame(setupFrame);
      setupFrame = requestAnimationFrame(setupMovement);
    };

    const clearFocus = () => {
      portrait.classList.remove("has-focus");
      pieces.forEach((piece) => {
        piece.classList.remove("active-piece", "near-strong", "near-soft");
      });
    };

    const activatePiece = (activePiece: SVGPathElement) => {
      clearFocus();
      portrait.classList.add("has-focus");
      activePiece.classList.add("active-piece");

      const active = boxCenter(activePiece);
      const influenceBoost = Math.max(active.w, active.h) * 0.34;

      pieces.forEach((piece) => {
        if (piece === activePiece) {
          return;
        }

        const center = boxCenter(piece);
        const distance = Math.hypot(center.x - active.x, center.y - active.y);

        if (distance < 62 + influenceBoost) {
          piece.classList.add("near-strong");
        } else if (distance < 132 + influenceBoost) {
          piece.classList.add("near-soft");
        }
      });
    };

    const renderTilt = () => {
      currentTilt = {
        x: currentTilt.x + (targetTilt.x - currentTilt.x) * TILT_DAMPING,
        y: currentTilt.y + (targetTilt.y - currentTilt.y) * TILT_DAMPING,
      };

      portrait.style.transform = `rotateX(${currentTilt.y.toFixed(3)}deg) rotateY(${currentTilt.x.toFixed(3)}deg)`;

      if (Math.abs(targetTilt.x - currentTilt.x) > 0.01 || Math.abs(targetTilt.y - currentTilt.y) > 0.01) {
        tiltFrame = requestAnimationFrame(renderTilt);
      }
    };

    const scheduleTilt = () => {
      if (!tiltFrame) {
        tiltFrame = requestAnimationFrame(() => {
          tiltFrame = 0;
          renderTilt();
        });
      }
    };

    const handlePointerEnter = () => {
      scheduleSetupMovement();
      portrait.classList.add("is-active");
    };

    const handlePointerLeave = () => {
      portrait.classList.remove("is-active");
      clearFocus();
      targetTilt = { x: 0, y: 0 };
      scheduleTilt();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (prefersReducedMotion) {
        return;
      }

      const rect = portrait.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);

      targetTilt = {
        x: Math.max(-5.5, Math.min(5.5, x * 0.009)),
        y: Math.max(-5.5, Math.min(5.5, -y * 0.009)),
      };

      scheduleTilt();
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.target instanceof window.SVGPathElement) {
        activatePiece(event.target);
      }
    };

    portrait.addEventListener("pointerenter", handlePointerEnter);
    portrait.addEventListener("pointerleave", handlePointerLeave);
    portrait.addEventListener("pointermove", handlePointerMove);
    svg.addEventListener("pointerover", handlePointerOver);
    window.addEventListener("resize", scheduleSetupMovement);

    scheduleSetupMovement();

    return () => {
      cancelAnimationFrame(setupFrame);
      cancelAnimationFrame(tiltFrame);
      portrait.removeEventListener("pointerenter", handlePointerEnter);
      portrait.removeEventListener("pointerleave", handlePointerLeave);
      portrait.removeEventListener("pointermove", handlePointerMove);
      svg.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("resize", scheduleSetupMovement);
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
          transition:
            transform 520ms cubic-bezier(.16, 1, .3, 1),
            filter 360ms ease,
            opacity 360ms ease;
          will-change: transform, filter, opacity;
        }

        .about-hover-portrait.is-active svg path {
          transform: translate(calc(var(--move-x) * .32), calc(var(--move-y) * .32));
        }

        .about-hover-portrait.has-focus svg path {
          opacity: .74;
        }

        .about-hover-portrait.has-focus svg path.near-soft {
          opacity: .94;
          transform:
            translate(calc(var(--move-x) * .58), calc(var(--move-y) * .58))
            scale(1.01);
          filter:
            brightness(1.08)
            saturate(1.06)
            drop-shadow(0 0 4px hsl(var(--secondary) / .28));
        }

        .about-hover-portrait.has-focus svg path.near-strong {
          opacity: 1;
          transform:
            translate(calc(var(--move-x) * .76), calc(var(--move-y) * .76))
            scale(1.022);
          filter:
            brightness(1.16)
            saturate(1.1)
            drop-shadow(0 0 7px hsl(var(--primary) / .44));
        }

        .about-hover-portrait.has-focus svg path.active-piece {
          opacity: 1;
          transform:
            translate(calc(var(--move-x) * .98), calc(var(--move-y) * .98))
            scale(1.055);
          filter:
            brightness(1.3)
            saturate(1.22)
            drop-shadow(0 0 8px rgb(255 255 255 / .42))
            drop-shadow(0 0 16px hsl(var(--primary) / .82))
            drop-shadow(0 0 26px hsl(var(--secondary) / .42));
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
