import AnimatedWaves from "@/components/AnimatedWaves";

const NOISE_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+";

const DynamicPageBackground = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/40" />

      <div className="absolute inset-0 opacity-45">
        <AnimatedWaves />
      </div>

      <div className="absolute -left-28 top-12 h-80 w-80 rounded-full bg-primary/25 blur-[130px] animate-orbit-soft" />
      <div className="absolute -right-20 top-16 h-80 w-80 rounded-full bg-secondary/24 blur-[130px] animate-orbit-soft" />
      <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/16 blur-[160px]" />

      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url('${NOISE_DATA_URL}')` }} />
    </div>
  );
};

export default DynamicPageBackground;
