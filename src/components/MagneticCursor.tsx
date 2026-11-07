import { useEffect, useRef, useState } from "react";

const RING_RATE = 12;
const DOT_RATE = 30;
const SETTLE_DISTANCE = 0.05;

export default function MagneticCursor() {
  const [hasPointer, setHasPointer] = useState(true);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mx = useRef(window.innerWidth / 2);
  const my = useRef(window.innerHeight / 2);
  const rx = useRef(mx.current);
  const ry = useRef(my.current);
  const dx = useRef(mx.current);
  const dy = useRef(my.current);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const pointerMq = window.matchMedia("(pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setHasPointer(pointerMq.matches && !motionMq.matches);
    update();
    pointerMq.addEventListener("change", update);
    motionMq.addEventListener("change", update);
    return () => {
      pointerMq.removeEventListener("change", update);
      motionMq.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!hasPointer) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const onMove = (e: MouseEvent) => {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        rx.current = e.clientX;
        ry.current = e.clientY;
        dx.current = e.clientX;
        dy.current = e.clientY;
      }
      mx.current = e.clientX;
      my.current = e.clientY;
    };

    let raf = 0;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const ringK = 1 - Math.exp(-RING_RATE * dt);
      const dotK = 1 - Math.exp(-DOT_RATE * dt);

      const prevRx = rx.current;
      const prevRy = ry.current;
      const prevDx = dx.current;
      const prevDy = dy.current;

      rx.current += (mx.current - rx.current) * ringK;
      ry.current += (my.current - ry.current) * ringK;
      dx.current += (mx.current - dx.current) * dotK;
      dy.current += (my.current - dy.current) * dotK;

      if (
        Math.abs(rx.current - prevRx) > SETTLE_DISTANCE ||
        Math.abs(ry.current - prevRy) > SETTLE_DISTANCE
      ) {
        ring.style.transform =
          "translate3d(" + rx.current + "px," + ry.current + "px,0) translate(-50%,-50%)";
      }
      if (
        Math.abs(dx.current - prevDx) > SETTLE_DISTANCE ||
        Math.abs(dy.current - prevDy) > SETTLE_DISTANCE
      ) {
        dot.style.transform =
          "translate3d(" + dx.current + "px," + dy.current + "px,0) translate(-50%,-50%)";
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const isHoverable = (el: Element | null) =>
      el && (el instanceof HTMLAnchorElement || el instanceof HTMLButtonElement || (el as HTMLElement).closest?.("[data-cursor-hover]"));

    const onOver = (e: MouseEvent) => {
      if (isHoverable(e.target as Element)) {
        document.body.classList.add("cursor-active");
      }
    };
    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Element | null;
      if (!isHoverable(related)) {
        document.body.classList.remove("cursor-active");
      }
    };

    const onMouseLeave = () => document.body.classList.add("cursor-hidden");
    const onMouseEnter = () => document.body.classList.remove("cursor-hidden");

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [hasPointer]);

  if (!hasPointer) return null;

  return (
    <>
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot" ref={dotRef} />
    </>
  );
}
