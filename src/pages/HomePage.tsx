import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { HERO_DATA } from '../data/siteData';

// Non-blocking dynamic lazy import for 3D robot chunk
const LazyRobotCanvas = React.lazy(() => import('../components/robot/RobotCanvas'));

const SPECIALIZATIONS = [
  'Workshops & Events',
  'AI & Cloud Solutions',
  'Hackathons & Training',
  'Student Mentorship',
];

const SpecializationPill: React.FC = React.memo(() => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SPECIALIZATIONS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#09041a]/95 border border-violet-500/25 text-zinc-300 shadow-[0_4px_18px_rgba(0,0,0,0.4)]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
      </span>
      <span className="text-[#9b96b0] font-normal type-caption">Specialized in:</span>
      <span className="font-medium text-white type-body-sm transition-colors duration-200">
        {SPECIALIZATIONS[index]}
      </span>
    </div>
  );
});

const HeroStatsRow: React.FC = React.memo(() => {
  return (
    <div className="w-full mt-2.5 sm:mt-3.5 lg:mt-3.5 relative z-20 flex-shrink-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 xl:gap-4">
        {HERO_DATA.stats.map((stat, idx) => (
          <div
            key={idx}
            className="relative group p-3 sm:p-4 xl:p-4.5 rounded-xl sm:rounded-2xl bg-[#060217]/90 border border-white/[0.08] hover:border-violet-500/35 transition-[border-color,transform] duration-200 flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Subtle Top Card Hairline Beam */}
            <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent group-hover:via-violet-400/50 transition-colors pointer-events-none" />

            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-b from-violet-600/08 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="type-stat-number text-white inline-block">
              <AnimatedCounter value={stat.value} duration={2400} startImmediately />
            </div>
            <div className="type-stat-label text-[#9b96b0] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const HomePage: React.FC = () => {
  const [shouldMountRobot, setShouldMountRobot] = useState(false);

  // Fast, Non-Blocking Robot Mount: mounts on the first animation frame after hero DOM paint
  useEffect(() => {
    const animId = requestAnimationFrame(() => {
      setShouldMountRobot(true);
    });
    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="home-cosmos-theme min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between items-center relative overflow-x-hidden lg:overflow-hidden bg-[#040112]">
      {/* ========================================================================= */}
      {/* 1. RESTRAINED LUXURY ATMOSPHERIC BACKGROUND (Priority 7 & 8)               */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep Cinema Vignette Void */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 65% 45%, rgba(124, 58, 237, 0.08) 0%, rgba(79, 70, 229, 0.03) 40%, rgba(4, 1, 18, 0.95) 75%, #040112 100%)',
          }}
        />

        {/* Extremely Sparse Ambient Starlight Field */}
        <div className="absolute inset-0 starlit-sky opacity-25" />

        {/* Soft Radial Purple Illumination Behind Robot Stage with Smooth Falloff */}
        <div
          className="absolute top-1/4 right-[5%] lg:right-[8%] w-[520px] h-[520px] rounded-full blur-[160px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(109, 40, 217, 0.07) 45%, transparent 70%)',
          }}
        />

        {/* Subdued Cyber Horizon Floor Grid (Whisper-Quiet Texture) */}
        <div
          className="absolute bottom-0 inset-x-0 h-[280px] pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to top, black 20%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 95%)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION — TWO REGION COMPOSITION (Priority 14 Responsive Layout)   */}
      {/* ========================================================================= */}
      <section
        id="home-hero"
        className="relative z-10 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 lg:pt-[76px] xl:pt-[82px] pb-6 sm:pb-6 lg:pb-4 flex-1 flex flex-col justify-between min-h-0 h-full"
      >
        {/* Main Content Area: Left Text Content + Desktop Bottom-Anchored Robot Stage */}
        <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-between relative my-auto">
          {/* ------------------------------------------------------------------- */}
          {/* LEFT COLUMN: HERO CONTENT (Unobstructed, Primary Focal Point)       */}
          {/* ------------------------------------------------------------------- */}
          <div className="w-full lg:max-w-[48%] xl:max-w-[46%] 2xl:max-w-[45%] flex flex-col items-start text-left z-20 relative space-y-2.5 sm:space-y-3.5 xl:space-y-4 my-auto">
            {/* 1. About Innovex Arena Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] type-badge text-[#c4b5fd] shadow-[0_0_15px_rgba(139,92,246,0.12)]">
              <Sparkles className="w-3.5 h-3.5 text-[#b7a4fb]" />
              <span>About Innovex Arena</span>
            </div>

            {/* 2. Primary Headline (Dominant, Balanced, Crisp Line Measure) */}
            <h1 className="type-display text-white">
              Fueling the Future of{' '}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#60a5fa] bg-clip-text text-transparent">
                Tech Creators
              </span>
            </h1>

            {/* 3. Subheading Tagline */}
            <h2 className="type-heading-sm text-[#c4b5fd]/90">
              Fueling the Future of Creators
            </h2>

            {/* 4. Supporting Description (Readable, Tighter Editorial Width) */}
            <p className="type-body text-[#9b96b0] max-w-lg lg:max-w-[430px] xl:max-w-[470px]">
              A tech-driven startup building AI-based products, cloud solutions, and empowering the next generation through workshops, hackathons, and training programs.
            </p>

            {/* 5. Specialization Pill (Clean Transition, No Trailing Pipe Cursor - Priority 11) */}
            <SpecializationPill />

            {/* 6. Action CTA Buttons Group (Priority 12 Hierarchy) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1.5">
              <Link to="/services">
                <button className="px-6 py-2.5 sm:py-3 rounded-full bg-white text-[#060212] font-medium type-button hover:bg-[#f4f0ff] transition-[background-color,box-shadow,transform] duration-200 flex items-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_0_36px_rgba(255,255,255,0.38)] active:scale-[0.98] cursor-pointer group">
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4 text-[#060212] group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/events">
                <button className="px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#d4c8ff] hover:text-white border border-white/[0.10] hover:border-violet-400/35 font-medium type-button transition-colors duration-200 active:scale-[0.98] cursor-pointer">
                  View Events
                </button>
              </Link>
              <Link to="/classes">
                <button className="px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#d4c8ff] hover:text-white border border-white/[0.10] hover:border-violet-400/35 font-medium type-button transition-colors duration-200 active:scale-[0.98] cursor-pointer">
                  Explore Classes
                </button>
              </Link>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: DEDICATED ROBOT STAGE (Spatial Depth & Grounding)     */}
          {/* ------------------------------------------------------------------- */}
          <div className="relative lg:absolute lg:right-0 lg:bottom-[-20px] lg:top-0 w-full lg:w-[52%] xl:w-[54%] 2xl:w-[55%] h-[380px] sm:h-[450px] lg:h-[calc(100%+24px)] min-h-[340px] flex items-center lg:items-end justify-center lg:justify-end z-10 pointer-events-none my-auto lg:my-0">
            {/* Robot Backdrop Ambient Glow (Soft, localized cinematic separation) */}
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] lg:w-[540px] h-[400px] sm:h-[500px] lg:h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.18)_0%,rgba(99,102,241,0.08)_45%,transparent_75%)] blur-3xl pointer-events-none" />

            {/* Interactive Real 3D Three.js Robot Canvas with Smooth Bottom Depth Fade */}
            <div
              className="w-full h-full relative z-10 flex items-center lg:items-end justify-center lg:justify-end pointer-events-auto"
              style={{
                maskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
              }}
            >
              {shouldMountRobot ? (
                <React.Suspense fallback={<div className="w-full h-full pointer-events-none" />}>
                  <LazyRobotCanvas className="w-full h-full" />
                </React.Suspense>
              ) : (
                <div className="w-full h-full pointer-events-none" />
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. FOUR STATISTICS CARDS ROW (Integrated Hero Foundation - Priority 13) */}
        {/* ===================================================================== */}
        <HeroStatsRow />
      </section>
    </div>
  );
};

export default HomePage;
