import React from 'react';

/**
 * ServicesAtmosphere — V8
 *
 * COMPLETE SECTION-ALIGNED ATMOSPHERIC LIGHT ARCHITECTURE
 *
 * ── V8 CALIBRATION & REFINEMENT ─────────────────────────────────
 *
 * In V8, every single section on the Services page is mapped to calibrated
 * environmental light sources with alternating asymmetric flow (left/right/center),
 * extreme soft falloffs (8–10 gradient stops), and intentional dark valleys.
 *
 * Section Coordinates (DOM Height ~9755px):
 *   Zone 1: Hero & Hackathons (y=0%–6%, x=46% left-bias, peak 0.145)
 *   Dark Valley 1: y=6.5%–7.5%
 *   Zone 2: Training & Student Development (y=8%–14%, x=58% right-bias, peak 0.088)
 *   Dark Valley 2: y=14%–15.5%
 *   Zone 3: Workshops Grid (y=16%–22%, x=42% left-bias, peak 0.085)
 *   Dark Valley 3: y=22%–23.5%
 *   Zone 4: Master Tech Header & Mode Cards (y=24%–37%, x=58% right-bias, peak 0.082)
 *   Dark Valley 4: y=37.5%–39.5%
 *   Zone 5: Universal Pillars & Comparison Matrix (y=40%–50%, x=42% left-bias, peak 0.076)
 *   Dark Valley 5: y=50.5%–52.5%
 *   Zone 6: Format Quiz & Campus Labs (y=53%–63%, x=58% right-bias, peak 0.072)
 *   Dark Valley 6: y=63.5%–65.5%
 *   Zone 7: Learner Testimonials & FAQs (y=66%–78%, x=44% left-bias, peak 0.068)
 *   Dark Valley 7: y=78%–79.5%
 *   Zone 8: Past Workshops & Ready-to-Start CTA (y=80%–88%, x=50% centered, peak 0.092)
 *   Terminal Void: y=88%–100% (fade into black footer)
 *
 * Meso Architecture:
 *   L09: 96px Architectural Grid Substrate (0.009 opacity, global)
 *   L10: Grid Reveal Masked strictly to illuminated zones (invisible in dark valleys)
 *
 * Micro Atmosphere:
 *   L11: Far depth particles (1px, 12 dots, static)
 *   L12: Mid depth particles (1.5px, 10 dots, static)
 *   L13: Near depth particles (2px, 6 dots, 40s animated float)
 */
export const ServicesAtmosphere: React.FC = () => (
  <>
    {/* ════════════════════════════════════════════════════════════
        MACRO — POSITIONED ENVIRONMENTAL LIGHT SOURCES
        ════════════════════════════════════════════════════════════ */}

    {/* ── L01  ZONE 1: HERO & HACKATHONS ───────────────────────────
        Position: y=3.2%, x=46% (left-bias)
        Peak: 0.145 (hero focus) with 10-stop falloff              */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: '12%',
        background: `
          radial-gradient(ellipse 76% 90% at 46% 28%,
            rgba(112, 64, 242, 0.145) 0%,
            rgba(102, 56, 228, 0.095) 14%,
            rgba(92,  48, 212, 0.060) 26%,
            rgba(82,  42, 195, 0.035) 38%,
            rgba(72,  36, 178, 0.018) 50%,
            rgba(62,  30, 158, 0.008) 62%,
            rgba(52,  24, 138, 0.003) 74%,
            rgba(42,  18, 118, 0.001) 84%,
            rgba(32,  12,  98, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L02  ZONE 2: TRAINING & STUDENT DEVELOPMENT ─────────────
        Position: y=11.2%, x=58% (right-bias)
        Peak: 0.088 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '6.8%',
        height: '10.5%',
        background: `
          radial-gradient(ellipse 74% 90% at 58% 42%,
            rgba(98, 52, 218, 0.088) 0%,
            rgba(88, 46, 200, 0.060) 14%,
            rgba(78, 40, 182, 0.038) 28%,
            rgba(68, 34, 165, 0.022) 42%,
            rgba(58, 28, 148, 0.011) 56%,
            rgba(48, 22, 128, 0.005) 68%,
            rgba(38, 16, 108, 0.001) 80%,
            rgba(28, 10,  88, 0.000) 90%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L03  ZONE 3: WORKSHOPS GRID ──────────────────────────────
        Position: y=18.6%, x=42% (left-bias)
        Peak: 0.085 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 pointer-events-none"
      style={{
        top: '14.8%',
        height: '10.2%',
        background: `
          radial-gradient(ellipse 76% 90% at 42% 40%,
            rgba(98, 52, 218, 0.085) 0%,
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

    {/* ── L04  ZONE 4: MASTER TECH HEADER & MODE CARDS ─────────────
        Position: y=31%, x=58% (right-bias)
        Peak: 0.082 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '23.2%',
        height: '16.5%',
        background: `
          radial-gradient(ellipse 78% 90% at 58% 46%,
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

    {/* ── L05  ZONE 5: UNIVERSAL PILLARS & COMPARISON MATRIX ────────
        Position: y=45.5%, x=42% (left-bias)
        Peak: 0.076 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 pointer-events-none"
      style={{
        top: '38.8%',
        height: '13.5%',
        background: `
          radial-gradient(ellipse 76% 90% at 42% 48%,
            rgba(95, 50, 215, 0.076) 0%,
            rgba(85, 44, 198, 0.052) 15%,
            rgba(75, 38, 180, 0.032) 30%,
            rgba(65, 32, 162, 0.017) 45%,
            rgba(55, 26, 145, 0.008) 58%,
            rgba(45, 20, 125, 0.003) 70%,
            rgba(35, 14, 105, 0.001) 82%,
            rgba(25,  8,  85, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L06  ZONE 6: FORMAT QUIZ & CAMPUS LABS ───────────────────
        Position: y=58%, x=58% (right-bias)
        Peak: 0.072 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '51.5%',
        height: '14.0%',
        background: `
          radial-gradient(ellipse 76% 90% at 58% 46%,
            rgba(95, 50, 215, 0.072) 0%,
            rgba(85, 44, 198, 0.048) 15%,
            rgba(75, 38, 180, 0.029) 30%,
            rgba(65, 32, 162, 0.015) 45%,
            rgba(55, 26, 145, 0.007) 58%,
            rgba(45, 20, 125, 0.003) 70%,
            rgba(35, 14, 105, 0.001) 82%,
            rgba(25,  8,  85, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L07  ZONE 7: LEARNER TESTIMONIALS & FAQS ─────────────────
        Position: y=71.5%, x=44% (left-bias)
        Peak: 0.068 with 9-stop falloff                            */}
    <div
      aria-hidden="true"
      className="svc-layer-lower absolute inset-x-0 pointer-events-none"
      style={{
        top: '64.5%',
        height: '15.0%',
        background: `
          radial-gradient(ellipse 74% 90% at 44% 48%,
            rgba(92, 48, 212, 0.068) 0%,
            rgba(82, 42, 195, 0.045) 15%,
            rgba(72, 36, 178, 0.027) 30%,
            rgba(62, 30, 158, 0.014) 45%,
            rgba(52, 24, 138, 0.006) 58%,
            rgba(42, 18, 118, 0.002) 70%,
            rgba(32, 12,  98, 0.001) 82%,
            rgba(22,  6,  78, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L08  ZONE 8: PAST EVENTS & READY-TO-START CTA ────────────
        Position: y=83.8%, x=50% (centered focal resolution)
        Peak: 0.092 with 8-stop falloff toward terminal void       */}
    <div
      aria-hidden="true"
      className="svc-layer-lower absolute inset-x-0 pointer-events-none"
      style={{
        top: '78.5%',
        height: '12.5%',
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

    {/* ── L09  TECHNICAL ARCHITECTURAL GRID SUBSTRATE ─────────────
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
        MICRO — DEPTH PARTICLES (EDGE-WEIGHTED & BALANCED)
        ════════════════════════════════════════════════════════════ */}

    {/* ── L11  PARTICLES FAR ───────────────────────────────────────
        1px dots. Edge-weighted across entire page height.         */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1px 1px at  5%   3%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%   5%, rgba(183,164,251,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at  6%  11%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 94%  13%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at  4%  19%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 96%  21%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at  8%  29%, rgba(255,255,255,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 92%  33%, rgba(183,164,251,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at  5%  44%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%  47%, rgba(183,164,251,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at  7%  57%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 93%  61%, rgba(183,164,251,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at  6%  71%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 94%  74%, rgba(183,164,251,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 12%  83%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 88%  85%, rgba(183,164,251,0.05) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L12  PARTICLES MID ───────────────────────────────────────
        1.5px dots. Mid-depth reference dots.                     */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at  4%   4%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 96%   6%, rgba(183,164,251,0.14) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  7%  12%, rgba(255,255,255,0.14) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 93%  18%, rgba(183,164,251,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  5%  31%, rgba(255,255,255,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 95%  35%, rgba(183,164,251,0.12) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  6%  46%, rgba(255,255,255,0.12) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 94%  59%, rgba(183,164,251,0.11) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  5%  72%, rgba(255,255,255,0.11) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 95%  84%, rgba(183,164,251,0.10) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L13  PARTICLES NEAR (animated) ───────────────────────────
        2px dots. 6 total. Far edge only (x ≤ 5% or x ≥ 95%).
        Animated: 40s slow vertical float.                        */}
    <div
      aria-hidden="true"
      className="contact-layer-particles-near absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at  3%   5%, rgba(255,255,255,0.18) 0%, transparent 100%),
          radial-gradient(2px 2px at 97%  12%, rgba(183,164,251,0.16) 0%, transparent 100%),
          radial-gradient(2px 2px at  4%  33%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  48%, rgba(183,164,251,0.13) 0%, transparent 100%),
          radial-gradient(2px 2px at  3%  70%, rgba(255,255,255,0.14) 0%, transparent 100%),
          radial-gradient(2px 2px at 97%  84%, rgba(183,164,251,0.12) 0%, transparent 100%)
        `,
      }}
    />
  </>
);
