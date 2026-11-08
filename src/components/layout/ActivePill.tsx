import { useEffect, useRef, type RefObject } from "react";

/**
 * Morphing navigation indicator — one element animated with clip-path: inset()
 * so its four edges move with independent tweens:
 *
 *   leading edge  : 360ms power3.out   (snaps ahead quickly)
 *   trailing edge : 550ms power3.inOut (the "stretch & settle" rhythm)
 *   vertical axis : 450ms power3.inOut
 *
 * variant="pill"      — full pill behind the active item
 * variant="underline" — thin bar hugging the bottom of the active item
 *
 * The ResizeObserver is set up once and reads activeId from a ref, so it only
 * re-snaps on actual viewport/font resize — never mid-morph.
 */

const power3Out = (t: number) => 1 - Math.pow(1 - t, 3);
const power3InOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const DUR_LEAD = 360;
const DUR_TRAIL = 550;
const DUR_VERT = 450;

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function toLocal(el: HTMLElement, root: HTMLElement): Rect {
  const e = el.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return {
    left: e.left - r.left,
    top: e.top - r.top,
    right: e.right - r.left,
    bottom: e.bottom - r.top,
  };
}

function applyBox(el: HTMLElement, r: Rect) {
  el.style.left = `${r.left}px`;
  el.style.top = `${r.top}px`;
  el.style.width = `${r.right - r.left}px`;
  el.style.height = `${r.bottom - r.top}px`;
}

function insetsOf(r: Rect, u: Rect) {
  return {
    left: r.left - u.left,
    top: r.top - u.top,
    right: u.right - r.right,
    bottom: u.bottom - r.bottom,
  };
}

interface ActivePillProps {
  containerRef: RefObject<HTMLElement | null>;
  activeId: string;
  variant?: "pill" | "underline";
  /** tailwind classes for the indicator fill */
  fillClass?: string;
  /** vertical inset (px) shaved off the top/bottom of the target rect (pill only) */
  insetY?: number;
  /** corner radius (px) for the clip-path round */
  radius?: number;
}

export function ActivePill({
  containerRef,
  activeId,
  variant = "pill",
  fillClass = "bg-primary",
  insetY = 0,
  radius = 99,
}: ActivePillProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const prevRef = useRef<HTMLElement | null>(null);
  /** the rect the pill currently occupies in "idle" state (local coords) */
  const boxRef = useRef<Rect | null>(null);
  /** most recent activeId, read by the ResizeObserver (set up once) */
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // ---- Morph effect: runs when activeId changes ----
  useEffect(() => {
    const root = containerRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;
    const target = root.querySelector<HTMLElement>(
      `[data-nav-item="${activeId}"]`
    );
    if (!target) return;

    const t = toLocal(target, root);

    if (variant === "underline") {
      t.left += 12;
      t.right -= 12;
      t.top = t.bottom - 2;
    } else if (insetY > 0) {
      t.top += insetY;
      t.bottom -= insetY;
    }

    const prevEl = prevRef.current;
    const hadPrev =
      prevEl && prevEl.isConnected && prevEl !== target && boxRef.current !== null;
    const p = hadPrev ? toLocal(prevEl, root) : null;
    if (p && variant === "underline") {
      p.left += 12;
      p.right -= 12;
      p.top = p.bottom - 2;
    } else if (p && insetY > 0) {
      p.top += insetY;
      p.bottom -= insetY;
    }

    prevRef.current = target;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!p || !boxRef.current || prefersReduced) {
      // first paint / reduced motion — snap into place
      applyBox(pill, t);
      pill.style.clipPath = `inset(0px round ${radius}px)`;
      boxRef.current = t;
      return;
    }

    // union box covering both old and new rects
    const u: Rect = {
      left: Math.min(t.left, p.left),
      top: Math.min(t.top, p.top),
      right: Math.max(t.right, p.right),
      bottom: Math.max(t.bottom, p.bottom),
    };
    applyBox(pill, u);

    const from = insetsOf(p, u);
    const to = insetsOf(t, u);
    const dir = t.left >= p.left ? 1 : -1;
    const t0 = performance.now();

    const tick = (now: number) => {
      const el = now - t0;
      const lead = power3Out(Math.min(el / DUR_LEAD, 1));
      const trail = power3InOut(Math.min(el / DUR_TRAIL, 1));
      const vert = power3InOut(Math.min(el / DUR_VERT, 1));

      let left: number, right: number;
      if (dir === 1) {
        left = from.left + (to.left - from.left) * trail; // trailing edge
        right = from.right + (to.right - from.right) * lead; // leading edge
      } else {
        left = from.left + (to.left - from.left) * lead; // leading edge
        right = from.right + (to.right - from.right) * trail; // trailing edge
      }
      const top = from.top + (to.top - from.top) * vert;
      const bottom = from.bottom + (to.bottom - from.bottom) * vert;

      pill.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;

      if (el < DUR_TRAIL) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        applyBox(pill, t);
        pill.style.clipPath = `inset(0px round ${radius}px)`;
        boxRef.current = t;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [activeId, containerRef, variant, insetY, radius]);

  // ---- Resize observer: set up ONCE, reads activeId from ref ----
  useEffect(() => {
    const root = containerRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;
    const ro = new ResizeObserver(() => {
      const target = root.querySelector<HTMLElement>(
        `[data-nav-item="${activeIdRef.current}"]`
      );
      if (!target) return;
      const t = toLocal(target, root);
      if (variant === "underline") {
        t.left += 12;
        t.right -= 12;
        t.top = t.bottom - 2;
      } else if (insetY > 0) {
        t.top += insetY;
        t.bottom -= insetY;
      }
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      applyBox(pill, t);
      pill.style.clipPath = `inset(0px round ${radius}px)`;
      boxRef.current = t;
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [containerRef, variant, insetY, radius]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return (
    <div
      ref={pillRef}
      aria-hidden
      className={`pointer-events-none absolute z-0 ${fillClass}`}
      style={{ clipPath: `inset(0px round ${radius}px)` }}
    />
  );
}
