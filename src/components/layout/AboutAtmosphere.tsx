import React from 'react';

/**
 * AboutAtmosphere
 *
 * Dedicated atmospheric background architecture for AboutPage (DOM height ~8270px).
 * Modeled directly after the ServicesAtmosphere:
 * - Macro: 5 positioned light sources aligned to all 10 content sections with alternating flow
 * - Meso: 96px technical grid substrate + light-zone masked grid reveal
 * - Micro: 3-tier depth particles with 40s slow vertical float
 * - Dark Valleys: Clean separation between zones ensuring 75–85% dark cinema contrast
 */
export const AboutAtmosphere: React.FC = () => (
  <>
    {/* ════════════════════════════════════════════════════════════
        MACRO — POSITIONED ENVIRONMENTAL LIGHT SOURCES
        ════════════════════════════════════════════════════════════ */}

    {/* ── L01  ZONE 1: ABOUT HERO & VISION/MISSION ─────────────────
        Position: y=8.5%, x=48%
        Peak: 0.142 with 10-stop falloff                           */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: '20%',
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

    {/* ── L02  ZONE 2: ARCHITECTURAL CAPABILITIES & PRODUCTS ───────
        Position: y=29%, x=40% (left-bias)
        Peak: 0.084 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '19.5%',
        height: '20.0%',
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

    {/* ── L03  ZONE 3: COHORTS & HACKATHONS/EVENTS ─────────────────
        Position: y=49.5%, x=60% (right-bias)
        Peak: 0.080 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 pointer-events-none"
      style={{
        top: '40.0%',
        height: '20.0%',
        background: `
          radial-gradient(ellipse 76% 90% at 60% 48%,
            rgba(98, 52, 218, 0.080) 0%,
            rgba(88, 46, 200, 0.054) 15%,
            rgba(78, 40, 182, 0.033) 30%,
            rgba(68, 34, 165, 0.018) 45%,
            rgba(58, 28, 148, 0.009) 58%,
            rgba(48, 22, 128, 0.004) 70%,
            rgba(38, 16, 108, 0.001) 82%,
            rgba(28, 10,  88, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L04  ZONE 4: CAREERS & ECOSYSTEM VOICES (TESTIMONIALS) ────
        Position: y=70.5%, x=42% (left-bias)
        Peak: 0.072 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '60.5%',
        height: '20.0%',
        background: `
          radial-gradient(ellipse 74% 90% at 42% 48%,
            rgba(92, 48, 212, 0.072) 0%,
            rgba(82, 42, 195, 0.048) 15%,
            rgba(72, 36, 178, 0.028) 30%,
            rgba(62, 30, 158, 0.015) 45%,
            rgba(52, 24, 138, 0.007) 58%,
            rgba(42, 18, 118, 0.002) 70%,
            rgba(32, 12,  98, 0.001) 82%,
            rgba(22,  6,  78, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L05  ZONE 5: NEWSLETTER & READY-TO-CONSTRUCT CTA ─────────
        Position: y=87.2%, x=50% (centered focal resolution)
        Peak: 0.092 with 8-stop falloff toward terminal void       */}
    <div
      aria-hidden="true"
      className="svc-layer-lower absolute inset-x-0 pointer-events-none"
      style={{
        top: '80.5%',
        height: '14.0%',
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

    {/* ════════════════════════════════════════════════════════════
        MESO — TECHNICAL ARCHITECTURAL STRUCTURE
        ════════════════════════════════════════════════════════════ */}

    {/* ── L06  TECHNICAL ARCHITECTURAL GRID SUBSTRATE ─────────────
        96px cells. Calibrated single-pass hardware-accelerated grid. */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
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

    {/* ════════════════════════════════════════════════════════════
        MICRO — DEPTH PARTICLES (EDGE-WEIGHTED & CALIBRATED)
        ════════════════════════════════════════════════════════════ */}

    {/* ── L08  PARTICLES FAR ───────────────────────────────────────
        1px dots across AboutPage vertical range                   */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
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
        1.5px dots mid-depth reference                             */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
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
        2px dots. Far edge only (x ≤ 5% or x ≥ 95%).
        Animated: 40s slow vertical float                          */}
    <div
      aria-hidden="true"
      className="contact-layer-particles-near absolute inset-0 pointer-events-none"
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
