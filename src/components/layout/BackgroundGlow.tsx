import React from 'react';
import { useLocation } from 'react-router-dom';

export const BackgroundGlow: React.FC = () => {
  const location = useLocation();

  // HomePage has its own dedicated, calibrated atmospheric background (Priority 7 & 8)
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Reflect Notes Starlit Sky Constellation Field */}
      <div className="absolute inset-0 starlit-sky opacity-50" />

      {/* Top Ambient Lilac Bloom */}
      <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[70vw] max-w-[850px] h-[35vw] max-h-[420px] rounded-full bg-[#b7a4fb]/[0.05] blur-[150px] animate-float-slow" />

      {/* Ultraviolet Core Depth Orb */}
      <div className="absolute top-[35%] -right-[8%] w-[45vw] max-w-[650px] h-[30vw] max-h-[400px] rounded-full bg-[#713dff]/[0.06] blur-[160px] animate-float-reverse" />

      {/* Horizon Glow Bottom Accent */}
      <div className="absolute -bottom-[12%] left-[5%] w-[50vw] max-w-[700px] h-[30vw] max-h-[380px] rounded-full bg-[#8562ff]/[0.06] blur-[170px] animate-pulse-glow" />
    </div>
  );
};
