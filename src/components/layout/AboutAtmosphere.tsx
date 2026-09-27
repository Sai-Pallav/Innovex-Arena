import React from 'react';

export const AboutAtmosphere: React.FC = () => (
  <>
    {/* ── L01  ZONE 1: ABOUT HERO & VISION/MISSION ─────────────────
        Fixed to viewport — covers full screen at all scroll positions */}
    <div
      aria-hidden="true"
      className="contact-layer-primary fixed inset-x-0 top-0 pointer-events-none z-0"
      style={{
        height: '55vh',
        background: `
          radial-gradient(ellipse 76% 90% at 48% 40%,
            rgba(112, 64, 242, 0.142) 0%,
            rgba(102, 56, 228, 0.092) 14%,
            rgba(92,  48, 212, 0.058) 26%,
            rgba(82,  42, 195, 0.034) 38%,
            rgba(72,  36, 178, 0.018) 50%,
            rgba(62,  30, 158, 0.008) 62%,
            rgba(52,  24, 138, 0.003) 74%,
            rgba(42,  18, 118, 0.001) 84%,
            rgba(32,  12,  98, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L02  MID-VIEWPORT DEPTH FIELD ────────────────────────────
        Right-bias, covers mid-screen band */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary fixed inset-x-0 pointer-events-none z-0"
      style={{
        top: '30vh',
        height: '50vh',
        background: `
          radial-gradient(ellipse 74% 90% at 40% 48%,
            rgba(98, 52, 218, 0.084) 0%,
            rgba(88, 46, 200, 0.058) 14%,
            rgba(78, 40, 182, 0.036) 28%,
            rgba(68, 34, 165, 0.020) 42%,
            rgba(58, 28, 148, 0.010) 56%,
            rgba(48, 22, 128, 0.004) 68%,
            rgba(38, 16, 108, 0.001) 80%,
            rgba(28, 10,  88, 0.000) 90%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L03  LOWER VIEWPORT RESOLUTION FIELD ─────────────────────
        Covers lower screen band */}
    <div
      aria-hidden="true"
      className="svc-layer-lower fixed inset-x-0 pointer-events-none z-0"
      style={{
        top: '60vh',
        height: '40vh',
        background: `
          radial-gradient(ellipse 84% 90% at 50% 46%,
            rgba(98, 52, 218, 0.092) 0%,
            rgba(88, 46, 200, 0.064) 16%,
            rgba(78, 40, 182, 0.040) 32%,
            rgba(68, 34, 165, 0.022) 48%,
            rgba(58, 28, 148, 0.010) 64%,
            rgba(48, 22, 128, 0.003) 78%,
            rgba(38, 16, 108, 0.000) 90%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L06  TECHNICAL ARCHITECTURAL GRID SUBSTRATE ─────────────
        96px cells. Fixed to viewport. */}
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(183, 164, 251, 0.016) 1px, transparent 1px),
          linear-gradient(90deg, rgba(183, 164, 251, 0.016) 1px, transparent 1px)
        `,
        backgroundSize: '96px 96px',
        maskImage: 'radial-gradient(ellipse 85% 95% at 50% 50%, black 35%, transparent 92%)',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 95% at 50% 50%, black 35%, transparent 92%)',
      }}
    />

    {/* ── L08  PARTICLES FAR ───────────────────────────────────────
        1px dots. Fixed to viewport. */}
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          radial-gradient(1px 1px at  5%   6%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%   8%, rgba(183,164,251,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at  6%  23%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 94%  27%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at  5%  45%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%  49%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at  7%  65%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 93%  69%, rgba(183,164,251,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 10%  85%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 90%  88%, rgba(183,164,251,0.05) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L09  PARTICLES MID ───────────────────────────────────────
        1.5px dots. Fixed to viewport. */}
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at  4%   9%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 96%  12%, rgba(183,164,251,0.14) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  7%  28%, rgba(255,255,255,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 93%  33%, rgba(183,164,251,0.12) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  6%  51%, rgba(255,255,255,0.12) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 94%  55%, rgba(183,164,251,0.11) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  5%  72%, rgba(255,255,255,0.11) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 95%  75%, rgba(183,164,251,0.10) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  8%  89%, rgba(255,255,255,0.10) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L10  PARTICLES NEAR (animated) ───────────────────────────
        2px dots. Fixed to viewport. 40s slow vertical float. */}
    <div
      aria-hidden="true"
      className="contact-layer-particles-near fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at  3%  10%, rgba(255,255,255,0.18) 0%, transparent 100%),
          radial-gradient(2px 2px at 97%  25%, rgba(183,164,251,0.16) 0%, transparent 100%),
          radial-gradient(2px 2px at  4%  48%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  68%, rgba(183,164,251,0.13) 0%, transparent 100%),
          radial-gradient(2px 2px at  3%  86%, rgba(255,255,255,0.14) 0%, transparent 100%)
        `,
      }}
    />
  </>
);
