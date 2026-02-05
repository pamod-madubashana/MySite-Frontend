import heroPortrait from "@/assets/hero-portrait.png";

const HeroPortrait = () => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-primary opacity-30 blur-xl animate-glow-pulse" />
      
      {/* Inner glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-lg" />
      
      {/* Rotating ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: "20s" }} />
      <div className="absolute inset-2 rounded-full border border-secondary/20 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
      
      {/* Portrait image */}
     <div className="relative w-full h-full flex items-center justify-center z-10 bg-transparent">
        <img
          src={heroPortrait}
          alt="Pamod Madubashana"
         className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,200,200,0.5)] mix-blend-normal"
         style={{ 
           background: 'transparent',
           imageRendering: 'auto'
         }}
        />
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-1/4 w-2 h-2 bg-primary rounded-full animate-float opacity-60" style={{ animationDelay: "0s" }} />
      <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-secondary rounded-full animate-float opacity-50" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-primary rounded-full animate-float opacity-40" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-secondary rounded-full animate-float opacity-60" style={{ animationDelay: "0.5s" }} />
    </div>
  );
};

export default HeroPortrait;