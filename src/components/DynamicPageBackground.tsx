import AnimatedWaves from "@/components/AnimatedWaves";

const NOISE_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+";

const DynamicPageBackground = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0B0E14]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,hsl(var(--primary)/0.12),transparent_34%),linear-gradient(180deg,transparent,hsl(var(--background))_86%)]" />

      <div className="absolute inset-0 opacity-25">
        <AnimatedWaves />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.055)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,hsl(var(--primary)/0.08),transparent)]" />

      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url('${NOISE_DATA_URL}')` }} />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,hsl(var(--foreground)/0.025)_4px)] opacity-35" />
    </div>
  );
};

export default DynamicPageBackground;
