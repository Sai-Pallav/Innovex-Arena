import React from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Building2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LearningModesSection } from '../components/modules/LearningModesSection';

export const ClassesPage: React.FC = () => {
  return (
    <div className="relative pt-28 pb-20 space-y-16 sm:space-y-24">
      {/* Background ultraviolet bloom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] ultraviolet-hero-bloom pointer-events-none -z-10" />

      {/* 1. HERO BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-5 animate-fade-up">
        <h1 className="font-rebond font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.12]">
          Online & Offline <span className="cosmic-text-gradient">Class Ecosystem</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#9b96b0] max-w-3xl mx-auto leading-relaxed font-normal">
          Accelerate your software engineering, cloud, and AI career through your preferred format. Choose between 100% live interactive online classes with 24/7 AI tutoring, or immersive in-person classroom labs with dual-monitor workstation rigs and desk-side mentors.
        </p>

        {/* Quick format quick-jump bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a href="#classes">
            <Button variant="hero" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Delivery Formats
            </Button>
          </a>
          <Link to="/contact">
            <Button variant="outline" size="md">
              Speak to Admissions
            </Button>
          </Link>
        </div>

        {/* Quick Highlights Summary Pills - 999px Glass Pills */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#9b96b0]">
          <div className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center gap-2 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
            <Video className="w-3.5 h-3.5 text-[#b7a4fb]" />
            <span className="text-slate-200">Live Interactive Virtual Cohorts</span>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center gap-2 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
            <Building2 className="w-3.5 h-3.5 text-[#ba9cff]" />
            <span className="text-slate-200">Physical Labs: Hyderabad, Bengaluru & Pune</span>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center gap-2 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#b7a4fb]" />
            <span className="text-slate-200">100% Shared Curriculum & Placement Guarantee</span>
          </div>
        </div>
      </section>

      {/* 2. THE COMPREHENSIVE LEARNING MODES SECTION */}
      <LearningModesSection />
    </div>
  );
};
