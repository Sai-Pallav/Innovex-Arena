import React from 'react';

/**
 * PageAtmosphere
 *
 * Shared 8-layer atmospheric background used on all inner pages
 * except HomePage (has its own dedicated system) and AboutPage
 * (has its own calibrated layers) and BlueprintPage (cyan theme).
 *
 * Layer map:
 *   L01  Near-black base — body background (#060212)
 *   L02  Atmospheric base field — wide, very faint purple wash
 *   L03  Primary illumination — dominant violet field, hero-zone peak
 *   L04  Secondary depth field — two asymmetric offset sub-fields
 *   L05  Peripheral corner accents — barely perceptible edge bleeds
 *   L06  Technical grid — masked to mid/lower zone, not behind heading
 *   L07  Depth particles — three layers (far/mid/near), edge-weighted
 *   L08B Lower decay tail — prevents hard black cutoff at page bottom
 *
 * Animations (defined in src/index.css):
 *   .contact-layer-primary     → contactFieldBreath  20s
 *   .contact-layer-secondary   → contactFieldDrift   25s
 *   .contact-layer-particles-near → contactParticleFloat 30s
 *
 * All animations are overridden to 0.01ms by prefers-reduced-motion.
 */
export const PageAtmosphere: React.FC = () => (
  <>
    {/* ── L02  Atmospheric base ─────────────────────────────────────
        90%×65% ellipse concentrated at the upper-centre.
        Peak 0.06 — body black dominates the rest of the page.     */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 90% 65% at 50% 18%,
            rgba(86, 45, 185, 0.06) 0%,
            rgba(60, 25, 140, 0.03) 45%,
            transparent 72%)
        `,
      }}
    />

    {/* ── L03  Primary illumination ─────────────────────────────────
        Dominant light source. Four-stop falloff so the shoulder
        fades cleanly through the card zone.
        height:100% — cannot extend below page.
        Animated: 20s vertical breath.                              */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: '100%',
        background: `
          radial-gradient(ellipse 68% 52% at 50% 20%,
            rgba(113, 61, 255, 0.14) 0%,
            rgba(113, 61, 255, 0.07) 25%,
            rgba(113, 61, 255, 0.02) 55%,
            transparent 75%)
        `,
      }}
    />

    {/* ── L04  Secondary depth field ────────────────────────────────
        Two asymmetric sub-fields behind left and right card columns.
        Much weaker than L03 (0.06 / 0.05).
        Animated: 25s horizontal drift, different phase from L03.   */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: '90%',
        background: `
          radial-gradient(ellipse 42% 38% at 25% 42%,
            rgba(80, 70, 228, 0.06) 0%,
            rgba(80, 70, 228, 0.02) 50%,
            transparent 72%),
          radial-gradient(ellipse 38% 34% at 76% 58%,
            rgba(133, 98, 255, 0.05) 0%,
            rgba(133, 98, 255, 0.01) 52%,
            transparent 74%)
        `,
      }}
    />

    {/* ── L05  Peripheral corner accents ───────────────────────────
        Four tiny corner bleeds (0.03–0.04) + bottom-centre tail.
        Prevents edges going dead-black without adding visible glow. */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 35% 28% at 0% 12%,
            rgba(96, 52, 210, 0.04) 0%,
            transparent 68%),
          radial-gradient(ellipse 32% 25% at 100% 18%,
            rgba(183, 164, 251, 0.03) 0%,
            transparent 68%),
          radial-gradient(ellipse 28% 22% at 2% 85%,
            rgba(80, 40, 180, 0.03) 0%,
            transparent 70%),
          radial-gradient(ellipse 28% 22% at 98% 88%,
            rgba(96, 52, 210, 0.03) 0%,
            transparent 70%),
          radial-gradient(ellipse 55% 22% at 50% 100%,
            rgba(80, 46, 180, 0.07) 0%,
            rgba(60, 30, 140, 0.03) 55%,
            transparent 78%)
        `,
      }}
    />

    {/* ── L06  Technical grid ───────────────────────────────────────
        0.018 opacity lines, 64px cells.
        Mask centred at 60% y — strongest in mid/card zone,
        nearly invisible behind the hero heading.                   */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(183, 164, 251, 0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(183, 164, 251, 0.018) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
        maskImage:
          'radial-gradient(ellipse 65% 55% at 50% 60%, black 5%, rgba(0,0,0,0.4) 40%, transparent 78%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 65% 55% at 50% 60%, black 5%, rgba(0,0,0,0.4) 40%, transparent 78%)',
      }}
    />

    {/* ── L07  Particles — far depth ────────────────────────────────
        1px dots, max 0.22 opacity.
        No particle above y=28% (heading / badge band clean).
        Edge-weighted: x ≤ 20% or x ≥ 80%.                         */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1px 1px at  6%  28%, rgba(255,255,255,0.20) 0%, transparent 100%),
          radial-gradient(1px 1px at 94%  25%, rgba(183,164,251,0.18) 0%, transparent 100%),
          radial-gradient(1px 1px at 11%  62%, rgba(255,255,255,0.16) 0%, transparent 100%),
          radial-gradient(1px 1px at 89%  58%, rgba(183,164,251,0.15) 0%, transparent 100%),
          radial-gradient(1px 1px at  3%  45%, rgba(183,164,251,0.14) 0%, transparent 100%),
          radial-gradient(1px 1px at 97%  48%, rgba(255,255,255,0.13) 0%, transparent 100%),
          radial-gradient(1px 1px at 19%  80%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1px 1px at 81%  77%, rgba(183,164,251,0.14) 0%, transparent 100%),
          radial-gradient(1px 1px at 44%  90%, rgba(255,255,255,0.12) 0%, transparent 100%),
          radial-gradient(1px 1px at 57%  86%, rgba(183,164,251,0.11) 0%, transparent 100%),
          radial-gradient(1px 1px at 28%  95%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 72%  92%, rgba(183,164,251,0.10) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L07  Particles — mid depth ────────────────────────────────
        1.5px dots, max 0.32 opacity. Still edge-weighted.          */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at  4%  35%, rgba(255,255,255,0.32) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 96%  32%, rgba(183,164,251,0.30) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  8%  70%, rgba(255,255,255,0.28) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 92%  67%, rgba(183,164,251,0.26) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 16%  54%, rgba(255,255,255,0.22) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 84%  50%, rgba(183,164,251,0.20) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 35%  84%, rgba(255,255,255,0.22) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 65%  88%, rgba(183,164,251,0.20) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L07  Particles — near depth ───────────────────────────────
        2px dots, max 0.40 opacity. Very sparse, far-edge only.
        Animated: 30s vertical float.                               */}
    <div
      aria-hidden="true"
      className="contact-layer-particles-near absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at  5%  38%, rgba(255,255,255,0.40) 0%, transparent 100%),
          radial-gradient(2px 2px at 95%  35%, rgba(183,164,251,0.38) 0%, transparent 100%),
          radial-gradient(2px 2px at  3%  75%, rgba(255,255,255,0.36) 0%, transparent 100%),
          radial-gradient(2px 2px at 97%  80%, rgba(183,164,251,0.34) 0%, transparent 100%),
          radial-gradient(2px 2px at 32%  94%, rgba(255,255,255,0.28) 0%, transparent 100%),
          radial-gradient(2px 2px at 68%  96%, rgba(183,164,251,0.26) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L08B  Lower decay tail ────────────────────────────────────
        Wide soft ellipse at page bottom.
        Prevents lower CTA / footer area going to hard black.       */}
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 pointer-events-none"
      style={{
        height: '40%',
        background: `
          radial-gradient(ellipse 75% 65% at 50% 100%,
            rgba(72, 40, 168, 0.09) 0%,
            rgba(55, 28, 130, 0.04) 52%,
            transparent 78%)
        `,
      }}
    />
  </>
);
