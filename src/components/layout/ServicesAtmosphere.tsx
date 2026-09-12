import React from 'react';

/**
 * ServicesAtmosphere — v4
 *
 * ── V3 DIAGNOSIS ────────────────────────────────────────────────
 *
 * V3 was architecturally correct (MACRO/MESO/MICRO hierarchy,
 * explicit dark zones, asymmetric offsets) but had five execution
 * problems:
 *
 *  1. DARK SUPPRESSOR BANDS TOO WIDE
 *     L03/L05 used 90%/85% horizontal ellipses at rgba(6,2,18,0.55).
 *     At page scale these rendered as visible horizontal dark stripes
 *     — the opposite of organic atmospheric absence. They announced
 *     themselves.
 *
 *  2. PRIMARY PEAK TOO CLOSE TO NAVIGATION
 *     Primary field peaked at y=18%. Hero heading sits at ~y=8–14%.
 *     Result: brightest background point was directly behind the
 *     heading — "glow behind text" effect the brief prohibits.
 *     Correct position: y=24–26% (below heading, around Hackathons
 *     entry), creating a stage rather than a halo.
 *
 *  3. CTA SECTION UNDER-ILLUMINATED
 *     Only L08 tail (peak 0.08) reached the CTA. The brief asks for
 *     "subtle atmospheric lift around major CTA areas." A dedicated
 *     CTA zone field is needed.
 *
 *  4. ATMOSPHERIC SPINE MISSING
 *     The brief asks for "soft central atmospheric continuity that
 *     connects sections." No V3 layer provided this. Instead L03/L05
 *     hard-interrupted continuity. A long, very thin, very faint
 *     central spine now handles this without competing with the
 *     dark transition zones.
 *
 *  5. L04 SECONDARY POSITIONED WRONG
 *     L04 started at top:40%, height:45% → peak at ~49% page y.
 *     That's the Training section, not Workshops. The Workshops
 *     section (9 items, the largest content block) sits at ~58–72%
 *     and received no dedicated illumination.
 *
 * ── V4 LAYER MAP ────────────────────────────────────────────────
 *
 *  L01  Body background #060212                    (global CSS)
 *
 *  MACRO — atmospheric illumination system
 *  L02  Atmospheric spine — long faint central column   (page continuity)
 *  L03  Primary field — hero stage                      (y=24%, left-biased)
 *  L04  Hackathons transition darkening — opacity sculpt (natural absence)
 *  L05  Secondary field — Workshops zone                (y=62%, right-biased)
 *  L06  CTA atmospheric field — lower page lift         (y=88%, centred)
 *  L07  Edge side bleeds — prevents viewport cropping   (both sides)
 *
 *  MESO — technical structure
 *  L08  Grid substrate — full page, very faint          (structural presence)
 *  L09  Grid reveal — atmospheric-masked near/mid zones (light reveals grid)
 *
 *  MICRO — depth particles
 *  L10  Particles far   — 14 dots, ≤ 0.12 opacity
 *  L11  Particles mid   — 10 dots, ≤ 0.20 opacity
 *  L12  Particles near  — 8 dots,  ≤ 0.24 opacity, animated
 *
 * ── CSS ANIMATIONS (src/index.css) ──────────────────────────────
 *  .contact-layer-primary        → contactFieldBreath  20s
 *  .contact-layer-secondary      → contactFieldDrift   25s
 *  .contact-layer-particles-near → contactParticleFloat 30s
 *  .svc-layer-lower              → svcLowerDrift       28s
 *
 *  All overridden to 0.01ms by prefers-reduced-motion.
 */
export const ServicesAtmosphere: React.FC = () => (
  <>

    {/* ════════════════════════════════════════════════════════════
        MACRO — ATMOSPHERIC ILLUMINATION
        ════════════════════════════════════════════════════════════ */}

    {/* ── L02  ATMOSPHERIC SPINE ──────────────────────────────────
        A very long, very narrow, very faint central column spanning
        the full page height. Peak opacity 0.028 — below conscious
        perception but above zero. Its sole purpose is to prevent
        the page from splitting into isolated visual islands as the
        user scrolls.

        Not a visible beam. Not a column. The user should simply
        perceive that all sections belong to one environment.

        Width: 38% x-radius — narrow enough to stay central.
        100% page height. No animation — spine must be stable.
        Slightly left of centre (48% x) to echo the primary.     */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 38% 100% at 48% 50%,
            rgba(86, 45, 195, 0.028) 0%,
            rgba(72, 36, 170, 0.010) 55%,
            transparent 82%)
        `,
      }}
    />

    {/* ── L03  PRIMARY LIGHT FIELD — HERO STAGE ───────────────────
        The dominant light source. Positioned at y=24% so it peaks
        BELOW the heading/badge zone (which sits ~y=8–14%).
        Creates a luminous stage that the hero content sits above,
        rather than a halo behind the letters.

        Falloff design: 5-stop curve.
          0%   → 0.13  (bright core, behind/below hero heading)
          16%  → 0.072 (shoulder, Hackathons heading zone)
          36%  → 0.030 (soft tail, upper card zone)
          58%  → 0.007 (near-zero, Training entry)
          82%  → transparent

        Width 58% x-radius — wide environmental field, not spotlight.
        Left-biased (42% x) for directional character.
        Animated: 20s vertical breath.                            */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: '62%',
        background: `
          radial-gradient(ellipse 58% 48% at 42% 24%,
            rgba(113, 61, 255, 0.130) 0%,
            rgba(104, 54, 246, 0.072) 16%,
            rgba(92,  46, 228, 0.030) 36%,
            rgba(78,  38, 200, 0.007) 58%,
            transparent                82%)
        `,
      }}
    />

    {/* ── L04  HACKATHONS TRANSITION — OPACITY SCULPTING ──────────
        V3 used an additive dark overlay to create "darkness between
        zones." That produced visible stripes. V4 uses a different
        approach: a very faint near-body-colour radial at the precise
        transition zone, narrow enough not to read as a band but
        sufficient to sculpt the primary field's falloff into a
        slightly deeper trough between the Hackathons and Training
        sections (~y=38–48%).

        Much narrower than V3 (60% wide vs 90%), much softer
        (max 0.28 vs 0.55 — half the intensity). Transition band
        is organic, not a stripe.                                 */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 60% 8% at 50% 44%,
            rgba(6, 2, 18, 0.28) 0%,
            rgba(6, 2, 18, 0.10) 52%,
            transparent 82%)
        `,
      }}
    />

    {/* ── L05  SECONDARY FIELD — WORKSHOPS ZONE ───────────────────
        The second illumination zone. Correctly repositioned to the
        Workshops section (~y=62% page), which is the largest content
        block (9 cards). Previously this covered Training — a
        mismatch between the visual emphasis and the content density.

        Right-biased (60% x) — creates the diagonal light path:
        hero upper-left → Workshops lower-right, matching how users
        scan vertically.

        Peak 0.054 — exactly 2.4× weaker than primary (0.13).
        This ratio is critical for hierarchy: secondary must read
        as a distinct, subordinate zone, not an extension of primary.

        Height 40% starting at top:48% → covers y=48–88%.
        Animated: 25s horizontal drift.                           */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '48%',
        height: '40%',
        background: `
          radial-gradient(ellipse 62% 50% at 60% 24%,
            rgba(96, 50, 218, 0.054) 0%,
            rgba(86, 44, 200, 0.026) 28%,
            rgba(72, 36, 175, 0.007) 55%,
            transparent               80%)
        `,
      }}
    />

    {/* ── L06  CTA ATMOSPHERIC FIELD ──────────────────────────────
        A dedicated field around the CTA section at page bottom
        (~y=88–100%). The brief explicitly requires: "subtle
        atmospheric lift around major CTA areas."

        IMPORTANT COMPOSITION RULE: The light must surround the CTA
        container, not illuminate it from inside. The container
        remains dark (#0a0118). The environment around it becomes
        slightly more atmospherically present.

        Anchored to bottom. Wide but faint (peak 0.065).
        Centred (51% x) — CTA is a centred element.
        Animated: 28s slow drift (svc-layer-lower).              */}
    <div
      aria-hidden="true"
      className="svc-layer-lower absolute inset-x-0 bottom-0 pointer-events-none"
      style={{
        height: '28%',
        background: `
          radial-gradient(ellipse 70% 62% at 51% 100%,
            rgba(96, 50, 218, 0.065) 0%,
            rgba(82, 42, 195, 0.030) 38%,
            rgba(65, 32, 165, 0.008) 62%,
            transparent               85%)
        `,
      }}
    />

    {/* ── L07  EDGE SIDE BLEEDS ────────────────────────────────────
        Vertical atmospheric strips at both viewport edges.
        Prevents the illumination from appearing clipped/bounded.
        Left stronger (0.028) echoes the left-biased primary.
        Right weaker (0.018) for asymmetric balance.
        Both span the full height so they're present at all scroll
        positions — the environment feels unbounded.             */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 12% 100% at 0%   50%,
            rgba(96, 52, 210, 0.028) 0%,
            transparent 78%),
          radial-gradient(ellipse 10% 100% at 100% 50%,
            rgba(183, 164, 251, 0.018) 0%,
            transparent 78%)
        `,
      }}
    />

    {/* ════════════════════════════════════════════════════════════
        MESO — TECHNICAL STRUCTURE
        ════════════════════════════════════════════════════════════ */}

    {/* ── L08  GRID SUBSTRATE ─────────────────────────────────────
        The "far" technical structure. Exists at the absolute minimum
        perceptible opacity (0.011) across the full page.
        Gives the environment the quality of an engineered space.
        Uses a large 88px cell — feels like infrastructure, not
        graph paper. Radial mask fades edges naturally.           */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(183, 164, 251, 0.011) 1px, transparent 1px),
          linear-gradient(90deg, rgba(183, 164, 251, 0.011) 1px, transparent 1px)
        `,
        backgroundSize: '88px 88px',
        maskImage:
          'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 65%, transparent 86%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 65%, transparent 86%)',
      }}
    />

    {/* ── L09  GRID REVEAL — ATMOSPHERIC ZONES ────────────────────
        The "near" grid layer. Stronger (0.021) but tightly masked
        so it only surfaces where the primary and secondary fields
        illuminate. The effect: technical structure is REVEALED by
        the ambient light, as if the grid physically exists inside
        the dark environment.

        Vertical mask profile mirrors the light field positions:
          0–11%   invisible  (hero heading clean)
          11–36%  present    (primary/Hackathons zone illuminated)
          36–50%  fades      (transition — grid disappears)
          50–72%  present    (secondary/Workshops zone illuminated)
          72–84%  fades      (second transition)
          84–94%  slight     (CTA ambient lift)
          94–100% invisible

        Left-biased ellipse (42% x) echoes primary field direction.  */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(183, 164, 251, 0.021) 1px, transparent 1px),
          linear-gradient(90deg, rgba(183, 164, 251, 0.021) 1px, transparent 1px)
        `,
        backgroundSize: '88px 88px',
        maskImage: `
          radial-gradient(ellipse 60% 100% at 42% 50%,
            rgba(0,0,0,0.68) 0%,
            rgba(0,0,0,0.20) 58%,
            transparent      82%),
          linear-gradient(
            to bottom,
            transparent        0%,
            transparent        9%,
            rgba(0,0,0,0.44)  18%,
            rgba(0,0,0,0.62)  30%,
            rgba(0,0,0,0.14)  44%,
            rgba(0,0,0,0.06)  50%,
            rgba(0,0,0,0.50)  58%,
            rgba(0,0,0,0.58)  68%,
            rgba(0,0,0,0.14)  76%,
            rgba(0,0,0,0.06)  82%,
            rgba(0,0,0,0.28)  88%,
            rgba(0,0,0,0.18)  94%,
            transparent       100%
          )
        `,
        WebkitMaskImage: `
          radial-gradient(ellipse 60% 100% at 42% 50%,
            rgba(0,0,0,0.68) 0%,
            rgba(0,0,0,0.20) 58%,
            transparent      82%),
          linear-gradient(
            to bottom,
            transparent        0%,
            transparent        9%,
            rgba(0,0,0,0.44)  18%,
            rgba(0,0,0,0.62)  30%,
            rgba(0,0,0,0.14)  44%,
            rgba(0,0,0,0.06)  50%,
            rgba(0,0,0,0.50)  58%,
            rgba(0,0,0,0.58)  68%,
            rgba(0,0,0,0.14)  76%,
            rgba(0,0,0,0.06)  82%,
            rgba(0,0,0,0.28)  88%,
            rgba(0,0,0,0.18)  94%,
            transparent       100%
          )
        `,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      }}
    />

    {/* ════════════════════════════════════════════════════════════
        MICRO — DEPTH PARTICLES
        Reduced further vs V3. MACRO must dominate at all times.
        Total: 32 dots across 3 depth layers (V3 had 36).

        PLACEMENT RULES (applied to every dot):
        • y < 12%: forbidden (hero/nav zone)
        • y 40–46%: forbidden (Hackathons→Training trough)
        • y 70–74%: forbidden (Workshops→Events trough)
        • x 20–80%, y < 38%: forbidden (heading/subtitle zone)
        • x 25–75%, y 38–55%: use sparingly (card content zone)
        ════════════════════════════════════════════════════════════ */}

    {/* ── L10  PARTICLES FAR ───────────────────────────────────────
        1px dots. Max opacity 0.12. Edge-weighted throughout.
        Opacities decrease toward page bottom — atmospheric decay.  */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1px 1px at  5%  15%, rgba(255,255,255,0.12) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%  13%, rgba(183,164,251,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at  8%  26%, rgba(255,255,255,0.11) 0%, transparent 100%),
          radial-gradient(1px 1px at 92%  24%, rgba(183,164,251,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at  3%  34%, rgba(183,164,251,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 97%  32%, rgba(255,255,255,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 13%  50%, rgba(255,255,255,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 87%  48%, rgba(183,164,251,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at  5%  57%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%  55%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 20%  63%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 80%  61%, rgba(183,164,251,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 10%  77%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 90%  75%, rgba(183,164,251,0.06) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L11  PARTICLES MID ───────────────────────────────────────
        1.5px dots. Max opacity 0.20.
        Deliberate gaps at the two trough zones (y ~40–46%, ~70–74%).
        Slightly more central placement allowed below y=50%.      */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at  4%  19%, rgba(255,255,255,0.18) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 96%  17%, rgba(183,164,251,0.16) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  7%  30%, rgba(255,255,255,0.17) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 93%  28%, rgba(183,164,251,0.15) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 15%  49%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 85%  47%, rgba(183,164,251,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  5%  60%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 95%  58%, rgba(183,164,251,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 26%  67%, rgba(255,255,255,0.12) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 74%  65%, rgba(183,164,251,0.11) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L12  PARTICLES NEAR (animated) ───────────────────────────
        2px dots. Max opacity 0.24. 8 total — very sparse.
        Far-edge only: x ≤ 5% or x ≥ 95%.
        Distributed intentionally — not uniform. Two per major
        vertical zone: upper (15–35%), mid (48–65%), lower (78–92%).
        Animated: 30s float.                                      */}
    <div
      aria-hidden="true"
      className="contact-layer-particles-near absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at  4%  22%, rgba(255,255,255,0.24) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  28%, rgba(183,164,251,0.22) 0%, transparent 100%),
          radial-gradient(2px 2px at  4%  52%, rgba(255,255,255,0.20) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  56%, rgba(183,164,251,0.18) 0%, transparent 100%),
          radial-gradient(2px 2px at  5%  78%, rgba(255,255,255,0.18) 0%, transparent 100%),
          radial-gradient(2px 2px at 95%  82%, rgba(183,164,251,0.16) 0%, transparent 100%),
          radial-gradient(2px 2px at  4%  92%, rgba(255,255,255,0.14) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  88%, rgba(183,164,251,0.12) 0%, transparent 100%)
        `,
      }}
    />

  </>
);
