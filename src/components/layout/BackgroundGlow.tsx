import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * BackgroundGlow
 *
 * Ambient global underglow for general pages.
 * Pages with dedicated atmospheric systems (HomePage, ServicesPage, AboutPage)
 * manage their own complete lighting, dark valleys, and depth particles.
 */
export const BackgroundGlow: React.FC = () => {
  const location = useLocation();

  // Pages with dedicated, fully-calibrated atmospheric environments
  if (
    location.pathname === '/' ||
    location.pathname === '/services' ||
    location.pathname === '/about'
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subdued Starlit Sky Constellation Field */}
      <div className="absolute inset-0 starlit-sky opacity-25" />

      {/* Top Ambient Lilac Bloom */}
      <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[70vw] max-w-[850px] h-[35vw] max-h-[420px] rounded-full bg-[#b7a4fb]/[0.025] blur-[160px] pointer-events-none" />

      {/* Subtle Depth Orb */}
      <div className="absolute top-[35%] -right-[8%] w-[45vw] max-w-[650px] h-[30vw] max-h-[400px] rounded-full bg-[#713dff]/[0.025] blur-[170px] pointer-events-none" />
    </div>
  );
};
