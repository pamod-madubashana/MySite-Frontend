import { useEffect, useRef } from "react";

const AnimatedWaves = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const drawWave = (
      yOffset: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      lineWidth: number
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      for (let x = 0; x <= canvas.width; x += 2) {
        const y =
          yOffset +
          Math.sin((x * frequency) / 1000 + time * speed) * amplitude +
          Math.sin((x * frequency * 0.5) / 1000 + time * speed * 1.5) * (amplitude * 0.5);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Teal/cyan waves
      drawWave(canvas.height * 0.5, 60, 3, 0.8, "rgba(0, 200, 200, 0.4)", 2);
      drawWave(canvas.height * 0.52, 50, 2.5, 1, "rgba(0, 180, 180, 0.3)", 1.5);
      drawWave(canvas.height * 0.48, 70, 2, 0.6, "rgba(0, 220, 220, 0.2)", 1);

      // Purple/magenta waves
      drawWave(canvas.height * 0.55, 55, 2.8, 0.9, "rgba(180, 100, 200, 0.4)", 2);
      drawWave(canvas.height * 0.58, 45, 3.2, 1.1, "rgba(160, 80, 180, 0.3)", 1.5);
      drawWave(canvas.height * 0.53, 65, 2.2, 0.7, "rgba(200, 120, 220, 0.2)", 1);

      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default AnimatedWaves;