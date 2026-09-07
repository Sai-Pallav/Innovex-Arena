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
      {/* 1. HERO BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-5 animate-fade-up">
        <h1 className="font-heading font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.12]">
          Online & Offline <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">Class Ecosystem</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
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

        {/* Quick Highlights Summary Pills */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
          <div className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Interactive Virtual Cohorts</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Physical Labs: Hyderabad, Bengaluru & Pune</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Shared Curriculum & Placement Guarantee</span>
          </div>
        </div>
      </section>

      {/* 2. THE COMPREHENSIVE LEARNING MODES SECTION */}
      <LearningModesSection />
    </div>
  );
};
