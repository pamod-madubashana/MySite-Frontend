import { useEffect, useRef, useState } from "react";

const RING_SPEED = 0.22;
const DOT_SPEED = 0.45;

export default function MagneticCursor() {
  const [hasPointer, setHasPointer] = useState(true);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPos = useRef({ x: mouseRef.current.x, y: mouseRef.current.y });
  const dotPos = useRef({ x: mouseRef.current.x, y: mouseRef.current.y });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasPointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setHasPointer(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!hasPointer) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    let raf: number;
    const animate = () => {
      const { x: mx, y: my } = mouseRef.current;
      const rp = ringPos.current;
      const dp = dotPos.current;

      rp.x += (mx - rp.x) * RING_SPEED;
      rp.y += (my - rp.y) * RING_SPEED;
      dp.x += (mx - dp.x) * DOT_SPEED;
      dp.y += (my - dp.y) * DOT_SPEED;

      ring.style.transform = `translate3d(${rp.x}px, ${rp.y}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${dp.x}px, ${dp.y}px, 0) translate(-50%, -50%)`;

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const hoverableSelector = "a, button, [data-cursor-hover]";
    const addActive = () => document.body.classList.add("cursor-active");
    const removeActive = () => document.body.classList.remove("cursor-active");

    const onEnter = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(hoverableSelector)) addActive();
    };
    const onLeave = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(hoverableSelector)) removeActive();
    };

    const onMouseLeave = () => document.body.classList.add("cursor-hidden");
    const onMouseEnter = () => document.body.classList.remove("cursor-hidden");

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
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
