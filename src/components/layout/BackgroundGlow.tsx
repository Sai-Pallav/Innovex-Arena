import React from 'react';

export const BackgroundGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle Cyber Spatial Grid with Vignette */}
      <div className="absolute inset-0 cyber-grid opacity-35" />

      {/* Top Center Cyan Ambient Glow */}
      <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[70vw] max-w-[850px] h-[35vw] max-h-[420px] rounded-full bg-primary/[0.06] blur-[150px] animate-float-slow" />

      {/* Soft Purple Depth Orb */}
      <div className="absolute top-[35%] -right-[8%] w-[45vw] max-w-[650px] h-[30vw] max-h-[400px] rounded-full bg-secondary/[0.05] blur-[160px] animate-float-reverse" />

      {/* Subtle Bottom Accent Depth */}
      <div className="absolute -bottom-[12%] left-[5%] w-[50vw] max-w-[700px] h-[30vw] max-h-[380px] rounded-full bg-primary/[0.04] blur-[170px] animate-pulse-glow" />
    </div>
  );
};
