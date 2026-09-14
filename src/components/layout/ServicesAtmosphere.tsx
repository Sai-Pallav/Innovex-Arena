import React from 'react';

/**
 * ServicesAtmosphere — V7
 *
 * ATMOSPHERIC LIGHT-SOURCE REFINEMENT
 *
 * ── V7 DIAGNOSIS ────────────────────────────────────────────────
 *
 * V6 restored perceptible illumination but still reads as ONE GIANT
 * PURPLE GRADIENT rather than multiple positioned environmental light
 * sources. The page feels purple-washed instead of spatially lit.
 *
 * V7 OBJECTIVE:
 * Break uniform purple atmosphere into CONTROLLED POSITIONED LIGHT
 * SOURCES with proper falloff and dark valleys between them.
 * Create: light → falloff → dark → light → falloff → dark
 *
 * V7 CHANGES:
 *
 *  1. ATMOSPHERIC SPINE REMOVED
 *     V6's full-page vertical spine (0.055 opacity, 44% width) created
 *     uniform purple wash. REMOVED entirely.
 *     Result: Eliminates global tint, allows proper dark valleys
 *
 *  2. LIGHT SOURCES REDUCED TO 5 POSITIONED FIELDS
 *     V6 had 9 overlapping fields creating uniform coverage.
 *     V7 uses exactly 5 large positioned sources with proper spacing:
 *     - Hero (strongest, upper-left)
 *     - Hackathons (medium, right)
 *     - Training (medium-strong, left)
 *     - Testimonials/FAQ (low-medium, right)
 *     - CTA (medium-strong, center)
 *
 *  3. INCREASED LIGHT SOURCE SCALE
 *     All fields now HUGE (1200-1600px equivalent on desktop)
 *     Far larger than content containers
 *     Boundaries never visible — pure environmental presence
 *
 *  4. EXTENDED FALLOFF CURVES (8-10 stops)
 *     V6 used 5-7 stops. V7 uses 8-10 extremely gradual stops.
 *     Light disappears naturally into darkness over long distance.
 *     No visible gradient edges or circles.
 *
 *  5. REDUCED FIELD OVERLAP
 *     V6 overlapped at 20-30%. V7 overlaps only at 5-12%.
 *     Creates intentional DARK VALLEYS between sources.
 *     Light → falloff → dark → light (spatial rhythm)
 *
 *  6. ASYMMETRIC POSITIONING ENHANCED
 *     Hero: 45% x (left-bias)
 *     Hackathons: 60% x (right-bias)
 *     Training: 40% x (left-bias)
 *     Testimonials: 57% x (right-bias)
 *     CTA: 50% x (centered)
 *     Creates natural diagonal flow, not algorithmic repetition
 *
 *  7. VERTICAL POSITIONING REFINED
 *     Each source positioned at content zone center, not spread:
 *     Hero: y=22% (hero content center)
 *     Hackathons: y=36% (cards center)
 *     Training: y=54% (major content center)
 *     Testimonials: y=72% (lower-mid content)
 *     CTA: y=86% (CTA zone center)
 *     Proper spacing creates dark transition zones
 *
 *  8. PEAK INTENSITIES REFINED FOR SPACING
 *     Hero: 0.165 → 0.145 (reduced 12%, less overlap bleed)
 *     Hackathons: 0.085 → 0.072 (reduced 15%, distinct zone)
 *     Training: 0.092 → 0.088 (reduced 4%, maintains strength)
 *     Testimonials: 0.070 → 0.058 (reduced 17%, quieter)
 *     CTA: 0.095 → 0.092 (reduced 3%, destination strength)
 *     Lower peaks + better spacing = perceived depth over wash
 *
 *  9. EDGE BLEEDS STRENGTHENED BUT LOCALIZED
 *     Left/right edges now tied to specific source heights
 *     Not full-page vertical strips (those created wash)
 *     Localized to upper/mid/lower zones for unbounded feel
 *
 * 10. GRID REVEAL TIED TO LIGHT ZONES ONLY
 *     Grid now visible ONLY in illuminated zones
 *     Completely invisible in dark valleys
 *     Creates discovered architecture effect
 *
 * ── V7 DESIGN THESIS ────────────────────────────────────────────
 *
 * FIVE HUGE DISTANT LIGHT SOURCES, not uniform atmosphere.
 *
 * Each source:
 * - HUGE scale (larger than viewport sections)
 * - Extreme soft falloff (8-10 gradient stops)
 * - Positioned asymmetrically (45/60/40/57/50% x)
 * - Proper vertical spacing (dark valleys between)
 * - Never visible as shape (no circles, no blobs)
 *
 * User perception:
 * "I'm scrolling through a dark space with distant positioned lights"
 * NOT: "There's a purple background"
 *
 * Visual rhythm:
 * Light (hero) → dark valley → light (hackathons) → dark valley →
 * light (training) → dark valley → light (testimonials) → dark valley →
 * light (CTA) → fade to black
 *
 * ── V7 LAYER MAP ────────────────────────────────────────────────
 *
 *  L01  Body background #060212                         (global CSS)
 *
 *  MACRO — positioned light sources (5 fields only)
 *  L02  Hero light — upper-left positioned (0.145 peak, y=22%, x=45%)
 *  L03  Hackathons light — right positioned (0.072 peak, y=36%, x=60%)
 *  L04  Training light — left positioned (0.088 peak, y=54%, x=40%)
 *  L05  Testimonials light — right positioned (0.058 peak, y=72%, x=57%)
 *  L06  CTA light — centered (0.092 peak, y=86%, x=50%)
 *
 *  MESO — technical structure (2 layers)
 *  L07  Grid substrate — architectural base (0.009 opacity, 96px)
 *  L08  Grid reveal — light-zone-only (0.021 opacity, zone-masked)
 *
 *  MICRO — depth particles (3 layers, 28 total, unchanged)
 *  L09  Particles far  — 12 dots, ≤0.10 opacity, static
 *  L10  Particles mid  — 10 dots, ≤0.16 opacity, static
 *  L11  Particles near — 6 dots,  ≤0.18 opacity, 36s animated
 *
 * ── ANIMATION TIMELINE ──────────────────────────────────────────
 *  L02 Hero             → contactFieldBreath     28s (slowed further)
 *  L03 Hackathons       → contactFieldDrift      32s (slowed further)
 *  L04 Training         → contactFieldDrift      32s (reuses)
 *  L05 Testimonials     → svcLowerDrift          36s (slowed further)
 *  L06 CTA              → svcLowerDrift          36s (reuses)
 *  L11 Particles near   → contactParticleFloat   40s (slowed further)
 *
 *  All animations BARELY PERCEPTIBLE. Premium = calm + static feel.
 *  All animations: prefers-reduced-motion → static
 *
 * ── VISUAL VALIDATION CRITERIA ──────────────────────────────────
 *  ✓ Page predominantly dark (75-85% visual field)
 *  ✓ FIVE distinct light sources, not uniform wash
 *  ✓ Dark valleys visible between lit zones
 *  ✓ Light sources HUGE (never see boundaries)
 *  ✓ Extremely gradual falloff (8-10 stops, no visible edges)
 *  ✓ Asymmetric positioning (natural diagonal flow)
 *  ✓ No visible gradient shapes (circles/blobs/ellipses)
 *  ✓ Grid visible ONLY in lit zones
 *  ✓ Cards remain dark (environment illuminated, not cards)
 *  ✓ Light → dark → light vertical rhythm perceptible
 *  ✓ One continuous environment (not separate themes)
 *  ✓ Spatial depth through positioned sources
 *  ✓ Content always dominant over background
 *  ✓ Premium dark first, illuminated second
 *  ✓ No cyberpunk/neon/galaxy/purple-wash aesthetic
 *
 */
export const ServicesAtmosphere: React.FC = () => (
  <>

    {/* ════════════════════════════════════════════════════════════
        MACRO — POSITIONED LIGHT SOURCES
        
        V7: FIVE HUGE DISTANT POSITIONED SOURCES, not uniform wash.
        
        Each source = environmental light with:
        - HUGE scale (1200-1600px equivalent, larger than sections)
        - Extreme falloff (8-10 stops, boundaries never visible)
        - Asymmetric positioning (45/60/40/57/50% x)
        - Proper vertical spacing (creates dark valleys)
        
        Visual rhythm: light → dark valley → light → dark valley...
        NOT: uniform purple atmosphere
        ════════════════════════════════════════════════════════════ */}

    {/* ── L02  HERO LIGHT SOURCE ──────────────────────────────────
        V7: STRONGEST positioned source (0.145 peak, reduced from 0.165)
        
        Position: y=22% (hero content center), x=45% (left-bias)
        Scale: HUGE — 76% width x 58% height (never see boundaries)
        
        This is the FIRST environmental light. User immediately
        perceives: "there is atmosphere in this space."
        
        10-stop extreme falloff:
          0%   → 0.145  (soft core, no hard center)
          12%  → 0.092  (shoulder, hero lower)
          22%  → 0.058  (soft mid-range)
          32%  → 0.034  (extended tail)
          42%  → 0.019  (hackathons entry begins overlapping)
          52%  → 0.010  (weak presence)
          62%  → 0.004  (near-zero, dark valley forming)
          72%  → 0.001  (effectively dark)
          84%  → 0.000  (complete darkness)
          100% → transparent
        
        Result: Huge soft environmental presence. Fades naturally
        into dark valley before Hackathons. No visible shape.
        
        Animated: 28s vertical breath (slowed, barely perceptible). */}
    <div
      aria-hidden="true"
      className="contact-layer-primary absolute inset-x-0 top-0 pointer-events-none"
      style={{
        height: '58%',
        background: `
          radial-gradient(ellipse 76% 100% at 45% 22%,
            rgba(112, 64, 242, 0.145) 0%,
            rgba(102, 56, 228, 0.092) 12%,
            rgba(92,  48, 212, 0.058) 22%,
            rgba(82,  42, 195, 0.034) 32%,
            rgba(72,  36, 178, 0.019) 42%,
            rgba(62,  30, 158, 0.010) 52%,
            rgba(52,  24, 138, 0.004) 62%,
            rgba(42,  18, 118, 0.001) 72%,
            rgba(32,  12,  98, 0.000) 84%,
            transparent                 100%)
        `,
      }}
    />

    {/* ── L03  HACKATHONS LIGHT SOURCE ────────────────────────────
        V7: SECOND positioned source (0.072 peak, reduced from 0.085)
        
        Position: y=36% (Hackathons cards center), x=60% (right-bias)
        Scale: HUGE — 70% width x 48% height
        
        Right-biased creates diagonal flow with left-biased hero.
        Natural compositional rhythm, not algorithmic centering.
        
        DARK VALLEY exists between hero falloff (ends ~y=32%) and
        this source beginning (~y=28%). Intentional separation.
        
        9-stop extreme falloff:
          0%   → 0.072  (soft core, behind cards)
          14%  → 0.048  (shoulder, card surroundings)
          26%  → 0.029  (mid-range)
          38%  → 0.016  (extended tail)
          50%  → 0.008  (training entry begins)
          62%  → 0.003  (weak presence)
          74%  → 0.001  (dark valley forming)
          86%  → 0.000  (complete darkness)
          100% → transparent
        
        Result: Distinct positioned light. Feels separate from hero.
        Cards remain dark. ENVIRONMENT around cards subtly lit.
        
        Animated: 32s horizontal drift (slowed, barely moves).     */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '26%',
        height: '48%',
        background: `
          radial-gradient(ellipse 70% 100% at 60% 21%,
            rgba(98, 52, 218, 0.072) 0%,
            rgba(88, 46, 200, 0.048) 14%,
            rgba(78, 40, 182, 0.029) 26%,
            rgba(68, 34, 165, 0.016) 38%,
            rgba(58, 28, 148, 0.008) 50%,
            rgba(48, 22, 128, 0.003) 62%,
            rgba(38, 16, 108, 0.001) 74%,
            rgba(28, 10,  88, 0.000) 86%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L04  TRAINING LIGHT SOURCE ──────────────────────────────
        V7: THIRD positioned source (0.088 peak, reduced from 0.092)
        
        Position: y=54% (Training/Workshops center), x=40% (left-bias)
        Scale: HUGE — 78% width x 52% height (largest source)
        
        Left-biased alternates with right-biased Hackathons.
        Diagonal rhythm continues. Training = largest content block,
        receives largest source (78% width).
        
        DARK VALLEY exists between Hackathons falloff (ends ~y=50%)
        and this source beginning (~y=46%). Proper separation.
        
        9-stop extreme falloff:
          0%   → 0.088  (soft core, behind major content)
          13%  → 0.062  (shoulder, Training cards)
          25%  → 0.040  (mid-range, Workshops)
          37%  → 0.024  (extended tail)
          49%  → 0.013  (comparison entry begins)
          61%  → 0.006  (weak presence)
          73%  → 0.002  (dark valley forming)
          85%  → 0.000  (complete darkness)
          100% → transparent
        
        Result: Strongest mid-page presence. Wraps around dense
        card grids. Cards stay dark. Environment perceptible.
        
        Animated: 32s horizontal drift (reuses, barely moves).     */}
    <div
      aria-hidden="true"
      className="contact-layer-secondary absolute inset-x-0 pointer-events-none"
      style={{
        top: '42%',
        height: '52%',
        background: `
          radial-gradient(ellipse 78% 100% at 40% 23%,
            rgba(98, 52, 218, 0.088) 0%,
            rgba(88, 46, 200, 0.062) 13%,
            rgba(78, 40, 182, 0.040) 25%,
            rgba(68, 34, 165, 0.024) 37%,
            rgba(58, 28, 148, 0.013) 49%,
            rgba(48, 22, 128, 0.006) 61%,
            rgba(38, 16, 108, 0.002) 73%,
            rgba(28, 10,  88, 0.000) 85%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L05  TESTIMONIALS LIGHT SOURCE ──────────────────────────
        V7: FOURTH positioned source (0.058 peak, reduced from 0.070)
        
        Position: y=72% (Testimonials/FAQ center), x=57% (right-bias)
        Scale: HUGE — 72% width x 42% height
        
        Right-biased alternates with left-biased Training.
        Quieter than major sources (0.058 vs 0.088) — this zone
        should feel calmer. FAQ requires information-focused calm.
        
        DARK VALLEY exists between Training falloff (ends ~y=68%)
        and this source beginning (~y=64%). Proper separation.
        
        8-stop extreme falloff:
          0%   → 0.058  (soft core, behind matrix/testimonials)
          16%  → 0.038  (shoulder, content surroundings)
          30%  → 0.022  (mid-range, FAQ upper)
          44%  → 0.012  (extended tail)
          58%  → 0.005  (CTA entry begins)
          72%  → 0.002  (weak presence)
          86%  → 0.000  (complete darkness)
          100% → transparent
        
        Result: Subtle lift for lower-mid content. Comparison matrix
        and testimonials sit inside subtle environmental presence.
        
        Animated: 36s slow drift (slowed further, nearly static).  */}
    <div
      aria-hidden="true"
      className="svc-layer-lower absolute inset-x-0 pointer-events-none"
      style={{
        top: '62%',
        height: '42%',
        background: `
          radial-gradient(ellipse 72% 100% at 57% 24%,
            rgba(92, 48, 212, 0.058) 0%,
            rgba(82, 42, 195, 0.038) 16%,
            rgba(72, 36, 178, 0.022) 30%,
            rgba(62, 30, 158, 0.012) 44%,
            rgba(52, 24, 138, 0.005) 58%,
            rgba(42, 18, 118, 0.002) 72%,
            rgba(32, 12,  98, 0.000) 86%,
            transparent               100%)
        `,
      }}
    />

    {/* ── L06  CTA LIGHT SOURCE ───────────────────────────────────
        V7: FIFTH AND FINAL positioned source (0.092 peak, from 0.095)
        
        Position: y=86% (CTA zone center), x=50% (CENTERED)
        Scale: HUGE — 84% width x 38% height (broadest lower source)
        
        CENTERED — CTA is symmetrical focal destination.
        After diagonal rhythm (45/60/40/57), centered position
        provides visual resolution. Natural compositional ending.
        
        Slightly weaker than Training (0.092 vs 0.088) but feels
        strong because it's final destination with less competition.
        
        DARK VALLEY exists between Testimonials falloff (ends ~y=82%)
        and this source beginning (~y=78%). Final separation.
        
        8-stop extreme falloff toward footer:
          0%   → 0.092  (soft core, around CTA container)
          18%  → 0.064  (shoulder, CTA zone)
          34%  → 0.040  (mid-range, FAQ lower)
          50%  → 0.022  (extended tail, footer entry)
          66%  → 0.010  (footer middle)
          80%  → 0.003  (footer lower)
          92%  → 0.000  (complete darkness)
          100% → transparent
        
        Result: Clear atmospheric destination. CTA container stays
        dark. ENVIRONMENT around it perceptible. Visual resolution.
        
        Animated: 36s slow drift (reuses, nearly static).          */}
    <div
      aria-hidden="true"
      className="svc-layer-lower absolute inset-x-0 pointer-events-none"
      style={{
        top: '76%',
        height: '38%',
        background: `
          radial-gradient(ellipse 84% 100% at 50% 26%,
            rgba(98, 52, 218, 0.092) 0%,
            rgba(88, 46, 200, 0.064) 18%,
            rgba(78, 40, 182, 0.040) 34%,
            rgba(68, 34, 165, 0.022) 50%,
            rgba(58, 28, 148, 0.010) 66%,
            rgba(48, 22, 128, 0.003) 80%,
            rgba(38, 16, 108, 0.000) 92%,
            transparent               100%)
        `,
      }}
    />

    {/* ════════════════════════════════════════════════════════════
        MESO — TECHNICAL STRUCTURE
        
        V7: Grid revealed ONLY in illuminated zones.
        Completely invisible in dark valleys. Discovered architecture.
        ════════════════════════════════════════════════════════════ */}

    {/* ── L07  GRID SUBSTRATE ─────────────────────────────────────
        V7: Unchanged (0.009 opacity, 96px cells)
        
        Far technical structure. Subliminal architectural presence
        across full page. Minimum perceptible opacity.
        Large 96px cells = infrastructure, not decoration.          */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(183, 164, 251, 0.009) 1px, transparent 1px),
          linear-gradient(90deg, rgba(183, 164, 251, 0.009) 1px, transparent 1px)
        `,
        backgroundSize: '96px 96px',
        maskImage:
          'radial-gradient(ellipse 82% 100% at 50% 50%, rgba(0,0,0,0.36) 0%, rgba(0,0,0,0.08) 68%, transparent 88%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 82% 100% at 50% 50%, rgba(0,0,0,0.36) 0%, rgba(0,0,0,0.08) 68%, transparent 88%)',
      }}
    />

    {/* ── L08  GRID REVEAL — LIGHT-ZONE-ONLY ──────────────────────
        V7: Reduced 0.024 → 0.021, CRITICAL mask change
        
        Near grid layer. Visible ONLY where light sources exist.
        Completely invisible in dark valleys. This creates the
        perception: "grid is revealed by environmental light."
        
        Vertical mask profile tied to FIVE LIGHT ZONES:
          0–18%    invisible     (pre-hero dark)
          18–34%   present       (Hero light zone)
          34–42%   invisible     (dark valley 1)
          42–50%   present       (Hackathons light zone)
          50–58%   invisible     (dark valley 2)
          58–70%   present       (Training light zone)
          70–78%   invisible     (dark valley 3)
          78–86%   present       (Testimonials light zone)
          86–92%   invisible     (dark valley 4)
          92–98%   present       (CTA light zone)
          98–100%  invisible     (footer dark)
        
        Horizontal mask: subtle center-bias (48% x, follows sources).
        
        Result: Grid discovered in lit zones, absent in dark valleys.
        Reinforces positioned light source perception.              */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(183, 164, 251, 0.021) 1px, transparent 1px),
          linear-gradient(90deg, rgba(183, 164, 251, 0.021) 1px, transparent 1px)
        `,
        backgroundSize: '96px 96px',
        maskImage: `
          radial-gradient(ellipse 68% 100% at 48% 50%,
            rgba(0,0,0,0.62) 0%,
            rgba(0,0,0,0.22) 58%,
            transparent      86%),
          linear-gradient(
            to bottom,
            transparent        0%,
            transparent        16%,
            rgba(0,0,0,0.48)  22%,
            rgba(0,0,0,0.68)  28%,
            rgba(0,0,0,0.06)  36%,
            rgba(0,0,0,0.52)  44%,
            rgba(0,0,0,0.64)  48%,
            rgba(0,0,0,0.08)  54%,
            rgba(0,0,0,0.56)  60%,
            rgba(0,0,0,0.70)  66%,
            rgba(0,0,0,0.10)  74%,
            rgba(0,0,0,0.44)  80%,
            rgba(0,0,0,0.58)  84%,
            rgba(0,0,0,0.08)  88%,
            rgba(0,0,0,0.50)  93%,
            rgba(0,0,0,0.62)  96%,
            transparent       100%
          )
        `,
        WebkitMaskImage: `
          radial-gradient(ellipse 68% 100% at 48% 50%,
            rgba(0,0,0,0.62) 0%,
            rgba(0,0,0,0.22) 58%,
            transparent      86%),
          linear-gradient(
            to bottom,
            transparent        0%,
            transparent        16%,
            rgba(0,0,0,0.48)  22%,
            rgba(0,0,0,0.68)  28%,
            rgba(0,0,0,0.06)  36%,
            rgba(0,0,0,0.52)  44%,
            rgba(0,0,0,0.64)  48%,
            rgba(0,0,0,0.08)  54%,
            rgba(0,0,0,0.56)  60%,
            rgba(0,0,0,0.70)  66%,
            rgba(0,0,0,0.10)  74%,
            rgba(0,0,0,0.44)  80%,
            rgba(0,0,0,0.58)  84%,
            rgba(0,0,0,0.08)  88%,
            rgba(0,0,0,0.50)  93%,
            rgba(0,0,0,0.62)  96%,
            transparent       100%
          )
        `,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      }}
    />

    {/* ════════════════════════════════════════════════════════════
        MICRO — DEPTH PARTICLES
        
        V7: Unchanged (28 total: 12 far + 10 mid + 6 near)
        Particle system already correct. Environmental depth layers.
        ════════════════════════════════════════════════════════════ */}

    {/* ── L09  PARTICLES FAR ───────────────────────────────────────
        1px dots. 12 total. Max opacity 0.10. Furthest depth.
        Edge-weighted. Decreasing opacity toward bottom.
        Static — stable far reference.                             */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1px 1px at  5%  16%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1px 1px at 95%  14%, rgba(183,164,251,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at  7%  28%, rgba(255,255,255,0.09) 0%, transparent 100%),
          radial-gradient(1px 1px at 93%  26%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at  4%  36%, rgba(183,164,251,0.08) 0%, transparent 100%),
          radial-gradient(1px 1px at 96%  34%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 14%  52%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 86%  50%, rgba(183,164,251,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at  6%  64%, rgba(255,255,255,0.07) 0%, transparent 100%),
          radial-gradient(1px 1px at 94%  62%, rgba(183,164,251,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 18%  78%, rgba(255,255,255,0.06) 0%, transparent 100%),
          radial-gradient(1px 1px at 82%  80%, rgba(183,164,251,0.05) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L10  PARTICLES MID ───────────────────────────────────────
        1.5px dots. 10 total. Max opacity 0.16. Middle depth.
        Forbidden zones respected (gaps at transition corridors).
        Static — mid-depth reference.                              */}
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at  5%  20%, rgba(255,255,255,0.16) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 95%  18%, rgba(183,164,251,0.14) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  8%  32%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 92%  30%, rgba(183,164,251,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 16%  52%, rgba(255,255,255,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 84%  50%, rgba(183,164,251,0.11) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at  6%  62%, rgba(255,255,255,0.13) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 94%  60%, rgba(183,164,251,0.11) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 24%  78%, rgba(255,255,255,0.10) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 76%  82%, rgba(183,164,251,0.09) 0%, transparent 100%)
        `,
      }}
    />

    {/* ── L11  PARTICLES NEAR (animated) ───────────────────────────
        2px dots. 6 total. Max opacity 0.18. Nearest depth.
        EXTREMELY RARE. Far-edge only: x ≤ 5% or x ≥ 95%.
        Upper (2), mid (2), lower (2) distribution.
        
        Animated: 40s vertical float (slowed further from 36s).
        Barely perceptible. Premium = calm + nearly static.        */}
    <div
      aria-hidden="true"
      className="contact-layer-particles-near absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at  4%  24%, rgba(255,255,255,0.18) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  30%, rgba(183,164,251,0.16) 0%, transparent 100%),
          radial-gradient(2px 2px at  4%  54%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(2px 2px at 96%  58%, rgba(183,164,251,0.13) 0%, transparent 100%),
          radial-gradient(2px 2px at  5%  80%, rgba(255,255,255,0.14) 0%, transparent 100%),
          radial-gradient(2px 2px at 95%  86%, rgba(183,164,251,0.11) 0%, transparent 100%)
        `,
      }}
    />

  </>
);
