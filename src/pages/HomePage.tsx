import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { RobotCanvas } from '../components/robot/RobotCanvas';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { HERO_DATA } from '../data/siteData';

const SPECIALIZATIONS = [
  'Workshops & Events',
  'AI & Cloud Solutions',
  'Hackathons & Training',
  'Student Mentorship',
];

export const HomePage: React.FC = () => {
  const [specializationIndex, setSpecializationIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSpecializationIndex((prev) => (prev + 1) % SPECIALIZATIONS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-cosmos-theme min-h-[calc(100vh-80px)] flex flex-col justify-between items-center relative overflow-hidden bg-[#040112]">
      {/* ========================================================================= */}
      {/* 1. ATMOSPHERIC BACKGROUND LAYERS                                          */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 starlit-sky opacity-75" />
        <div className="absolute inset-0 ultraviolet-hero-bloom pointer-events-none opacity-80" />

        {/* Ambient Subtle Glow Behind the Right-Side Robot Stage */}
        <div
          className="absolute top-1/3 right-0 lg:right-12 w-[480px] h-[580px] rounded-full blur-[140px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(99, 102, 241, 0.12) 40%, rgba(56, 189, 248, 0.04) 65%, transparent 80%)',
          }}
        />

        {/* Cyber Horizon Lines */}
        <div
          className="absolute bottom-0 inset-x-0 h-[360px] pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(139, 92, 246, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.12) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(to top, black, transparent 90%)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION — TWO REGION COMPOSITION (Reference 2 Target)            */}
      {/* ========================================================================= */}
      <section
        id="home-hero"
        className="relative z-10 w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-6 flex-1 flex flex-col justify-between"
      >
        {/* Main Grid: LEFT = Content (7 cols), RIGHT = Robot Stage (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center w-full my-auto">
          {/* ------------------------------------------------------------------- */}
          {/* LEFT COLUMN: HERO CONTENT (Unobstructed, Primary Focal Point)       */}
          {/* ------------------------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20 space-y-4 sm:space-y-5">
            {/* 1. About Innovex Arena Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-medium text-[#c4b5fd] shadow-[0_0_15px_rgba(139,92,246,0.12)] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#b7a4fb]" />
              <span>About Innovex Arena</span>
            </div>

            {/* 2. Primary Headline */}
            <h1 className="font-aeonik font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] tracking-[-0.03em] text-white leading-[1.08]">
              Fueling the Future of{' '}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#60a5fa] bg-clip-text text-transparent">
                Tech Creators
              </span>
            </h1>

            {/* 3. Subheading Tagline */}
            <h2 className="text-base sm:text-lg lg:text-xl font-medium text-[#a78bfa] tracking-tight">
              Fueling the Future of Creators
            </h2>

            {/* 4. Supporting Description */}
            <p className="text-xs sm:text-sm lg:text-base text-[#9ca3af] leading-relaxed max-w-xl font-normal">
              A tech-driven startup building AI-based products, cloud solutions, and empowering the next generation through workshops, hackathons, and training programs.
            </p>

            {/* 5. Specialization Pill with Dynamic Typing Cue */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b0520]/90 border border-violet-500/25 text-xs sm:text-sm text-zinc-300 shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-zinc-400 font-normal">Specialized in:</span>
              <span className="font-semibold text-white transition-opacity duration-300">
                {SPECIALIZATIONS[specializationIndex]}
              </span>
              <span className="text-violet-400 font-mono animate-pulse">|</span>
            </div>

            {/* 6. Action CTA Buttons Group */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/services">
                <button className="px-6 py-2.5 sm:py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-zinc-100 transition-all flex items-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.35)] group">
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link to="/events">
                <button className="px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] hover:border-white/25 font-medium text-xs sm:text-sm transition-all backdrop-blur-md">
                  View Events
                </button>
              </Link>
              <Link to="/classes">
                <button className="px-5 py-2.5 sm:py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] hover:border-white/25 font-medium text-xs sm:text-sm transition-all backdrop-blur-md">
                  Explore Classes
                </button>
              </Link>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: DEDICATED ROBOT STAGE (Standing Beside Content)       */}
          {/* ------------------------------------------------------------------- */}
          <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[440px] lg:h-[580px] xl:h-[640px] 2xl:h-[680px] lg:-mb-10 xl:-mb-12 flex items-center justify-center lg:justify-end z-10">
            {/* Robot Backdrop Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] lg:w-[480px] h-[440px] sm:h-[520px] lg:h-[600px] bg-gradient-to-b from-violet-600/20 via-indigo-600/12 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Interactive Real 3D Three.js Robot Canvas */}
            <div className="w-full h-full relative z-10 flex items-center justify-center">
              <RobotCanvas className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. FOUR STATISTICS CARDS ROW (Preserved Design Language)              */}
        {/* ===================================================================== */}
        <div className="w-full mt-4 sm:mt-6 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 xl:gap-5">
            {HERO_DATA.stats.map((stat, idx) => (
              <div
                key={idx}
                className="relative group p-4 sm:p-5 rounded-2xl bg-[#060214]/90 border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-1 shadow-[0_12px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-aeonik text-white tracking-tight">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-xs sm:text-sm text-[#9b96b0] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
