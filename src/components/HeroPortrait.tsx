import heroPortrait from "@/assets/hero-portrait.png";

const HeroPortrait = () => {
  return (
    <div className="hero-portrait relative w-80 h-80 md:w-96 md:h-96 lg:w-[32rem] lg:h-[32rem] xl:w-[36rem] xl:h-[36rem]">
      <img
        src={heroPortrait}
        alt="Pamod Madubashana"
        className="w-full h-full object-contain"
        style={{ 
          background: 'transparent',
          border: '0',
          borderRadius: '0',
          boxShadow: 'none',
          backdropFilter: 'none',
          filter: 'saturate(0.92) contrast(0.95) brightness(1.02) drop-shadow(-10px -8px 16px rgba(64,196,255,0.16)) drop-shadow(10px 6px 16px rgba(160,90,255,0.14))',
          maskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%), linear-gradient(to right, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%), linear-gradient(to right, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in'
        }}
      />
    </div>
  );
};

export default HeroPortrait;