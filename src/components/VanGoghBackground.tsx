import { useMemo } from "react";

const STAR_COUNT = 20;

const VanGoghBackground = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, id) => ({
        id,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${2 + Math.random() * 2}s`,
        size: `${3 + Math.random() * 3}px`,
      })),
    [],
  );

  return (
    <div className="vangogh-bg" aria-hidden="true">
      <div className="swirl swirl-1" />
      <div className="swirl swirl-2" />
      <div className="swirl swirl-3" />
      <div className="swirl swirl-4" />
      <div className="swirl swirl-5" />
      
      <div className="stars">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
              width: star.size,
              height: star.size,
            }}
          />
        ))}
      </div>
      
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default VanGoghBackground;
