import React from 'react';

/**
 * PageAtmosphere
 *
 * Shared atmospheric background used on all inner pages:
 * Products, Classes, Events, Careers, Internships, Contact, Gallery, Blog, AdminLoginPage.
 *
 * Refined to match ServicesAtmosphere standards:
 * - Macro: 3 calibrated positioned environmental light sources (Hero, Mid-content, Lower/CTA)
 *   with 8–10 gradual gradient stops and intentional dark valleys
 * - Meso: 96px architectural grid substrate (0.009) + light-zone masked reveal (0.021)
 * - Micro: 3-tier depth particles (far 1px, mid 1.5px, near 2px with 40s slow float)
 * - Cinema Void: Preserves 75–85% dark foundation (#060212)
 */
export const PageAtmosphere: React.FC = () => (
  <>
    {/* ════════════════════════════════════════════════════════════
        MACRO — POSITIONED ENVIRONMENTAL LIGHT SOURCES
        ════════════════════════════════════════════════════════════ */}

    {/* ── L01  HERO ILLUMINATION FIELD ─────────────────────────────
        Position: y=20%, x=48%
        Peak: 0.142 with 10-stop gradual falloff                   */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: '48%',
        background: `
          radial-gradient(ellipse 74% 88% at 48% 26%,
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

    {/* ── L02  MID-CONTENT DEPTH FIELD ─────────────────────────────
        Position: y=56%, x=58% (right-bias)
        Peak: 0.082 with 9-stop gradual falloff                    */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '38%',
        height: '42%',
        background: `
          radial-gradient(ellipse 76% 88% at 58% 46%,
            rgba(98, 52, 218, 0.082) 0%,
            rgba(88, 46, 200, 0.056) 15%,
            rgba(78, 40, 182, 0.034) 30%,
            rgba(68, 34, 165, 0.019) 45%,
            rgba(58, 28, 148, 0.009) 58%,
            rgba(48, 22, 128, 0.004) 70%,
            rgba(38, 16, 108, 0.001) 82%,
            rgba(28, 10,  88, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L03  LOWER / CTA RESOLUTION FIELD ────────────────────────
        Position: y=88%, x=50% (centered)
        Peak: 0.088 with 8-stop gradual falloff                    */}
    <div
      aria-hidden="true"
      className="svc-layer-lower absolute inset-x-0 pointer-events-none"
      style={{
        top: '74%',
        height: '26%',
        background: `
          radial-gradient(ellipse 82% 88% at 50% 50%,
            rgba(98, 52, 218, 0.088) 0%,
            rgba(88, 46, 200, 0.060) 16%,
            rgba(78, 40, 182, 0.038) 32%,
            rgba(68, 34, 165, 0.020) 48%,
            rgba(58, 28, 148, 0.009) 64%,
            rgba(48, 22, 128, 0.003) 78%,
            rgba(38, 16, 108, 0.000) 90%,
            transparent               100%)
        `,
      }}
    />

    {/* ════════════════════════════════════════════════════════════
        MESO — TECHNICAL ARCHITECTURAL STRUCTURE
        ════════════════════════════════════════════════════════════ */}

    {/* ── L04  TECHNICAL ARCHITECTURAL GRID SUBSTRATE ─────────────
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

    {/* ── L06  PARTICLES FAR ───────────────────────────────────────
        1px dots. Subtle far reference dots.                       */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1px 1px at  5%  12%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%  16%, rgba(183,164,251,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at  6%  38%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 94%  44%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at  5%  65%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%  72%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at  8%  88%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 92%  92%, rgba(183,164,251,0.05) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L07  PARTICLES MID ───────────────────────────────────────
        1.5px dots. Mid-depth reference dots.                      */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at  4%  18%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 96%  24%, rgba(183,164,251,0.14) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  7%  48%, rgba(255,255,255,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 93%  56%, rgba(183,164,251,0.12) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  5%  78%, rgba(255,255,255,0.11) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 95%  85%, rgba(183,164,251,0.10) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L08  PARTICLES NEAR (animated) ───────────────────────────
        2px dots. Far-edge only (x ≤ 5% or x ≥ 95%).
        Animated: 40s slow vertical float                          */}
    <div
      aria-hidden="true"
      className="contact-layer-particles-near absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at  3%  20%, rgba(255,255,255,0.18) 0%, transparent 100%),
          radial-gradient(2px 2px at 97%  32%, rgba(183,164,251,0.16) 0%, transparent 100%),
          radial-gradient(2px 2px at  4%  60%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  78%, rgba(183,164,251,0.13) 0%, transparent 100%)
        `,
      }}
    />
  </>
);
