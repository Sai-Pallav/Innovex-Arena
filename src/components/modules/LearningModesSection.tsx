import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Building2,
  Sparkles,
  Laptop,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Compass,
  Award,
  Layers,
  Wifi,
  Cpu,
  Monitor,
  Check,
  X,
  Flame,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CyberCard } from '../ui/CyberCard';
import {
  LEARNING_MODES,
  COMPARISON_MATRIX,
  UNIVERSAL_PILLARS,
  CAMPUS_HUBS,
  LEARNING_FAQS,
  LEARNER_TESTIMONIALS_SPLIT,
} from '../../data/learningModesData';
import { ClassBookingDialog } from './ClassBookingDialog';
import { LearningModeType } from '../../types';

export const LearningModesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | LearningModeType>('all');
  const [showMatrix, setShowMatrix] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDefaultMode, setBookingDefaultMode] = useState<LearningModeType>('online');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Self-selector widget state
  const [selectedSchedule, setSelectedSchedule] = useState<'working-pro' | 'full-time' | 'hybrid'>('working-pro');
  const [selectedStyle, setSelectedStyle] = useState<'flexible' | 'immersion' | 'balanced'>('flexible');

  const openBookingModal = (mode: LearningModeType) => {
    setBookingDefaultMode(mode);
    setBookingDialogOpen(true);
  };

  // Determine recommendation based on selector
  const getRecommendation = () => {
    if (selectedSchedule === 'working-pro' || selectedStyle === 'flexible') {
      return {
        mode: '100% Live Online Academy',
        modeId: 'online' as LearningModeType,
        tagline: 'Ideal for your schedule: Evening/weekend live classes with 24/7 AI tutor support & recordings.',
        badge: 'Recommended for Working Professionals',
        badgeColor: 'border-cyan-400/30 text-cyan-300 bg-cyan-400/10',
      };
    } else if (selectedSchedule === 'full-time' || selectedStyle === 'immersion') {
      return {
        mode: 'In-Person Campus Classroom',
        modeId: 'offline' as LearningModeType,
        tagline: 'Ideal for maximum immersion: High-spec dual RTX workstations, desk-side instructors, and peer sprint pods.',
        badge: 'Recommended for Dedicated Immersion',
        badgeColor: 'border-purple-400/30 text-purple-300 bg-purple-500/10',
      };
    } else {
      return {
        mode: 'Hybrid Flex Track',
        modeId: 'hybrid' as LearningModeType,
        tagline: 'Ideal balance: Weekday evenings online + Saturday intensive on-campus build sprints and networking.',
        badge: 'Recommended for Balanced Flexibility',
        badgeColor: 'border-emerald-400/30 text-emerald-300 bg-emerald-500/10',
      };
    }
  };

  const recommendation = getRecommendation();

  const filteredModes =
    activeTab === 'all'
      ? LEARNING_MODES
      : LEARNING_MODES.filter((m) => m.id === activeTab);

  return (
    <section id="classes" className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16 sm:space-y-20">
      {/* 1. SECTION HEADER */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h2 className="font-heading font-bold text-2xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-tight">
          Master Tech Your Way: <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">
            Online, Offline Campus, or Hybrid
          </span>
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Whether you learn from your home desk with global peers or code side-by-side with mentors in our physical campus labs, you get the exact same industry-grade syllabus, real-world capstones, and tier-1 hiring network.
        </p>
      </div>

      {/* 2. MODE SELECTOR TABS */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#0b101e]/80 border border-white/[0.08] backdrop-blur-md gap-1.5 max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-400/30 shadow-[0_0_15px_rgba(0,217,255,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            All Formats ({LEARNING_MODES.length})
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === 'online'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,217,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            100% Live Online
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === 'offline'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            In-Person Campus Lab
          </button>
          <button
            onClick={() => setActiveTab('hybrid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === 'hybrid'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Hybrid Flex Track
          </button>
        </div>
      </div>

      {/* 3. MODE CARDS DEEP-DIVE */}
      <div className={`grid gap-6 items-stretch ${
        activeTab === 'all'
          ? 'grid-cols-1 lg:grid-cols-3'
          : 'grid-cols-1 max-w-2xl mx-auto'
      }`}>
        {filteredModes.map((mode) => (
          <CyberCard
            key={mode.id}
            glow={mode.id === 'offline' ? 'purple' : 'cyan'}
            className="p-6 sm:p-7 flex flex-col justify-between"
          >
            <div className="space-y-5">
              {/* Badge & Icon Header */}
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold tracking-wider border ${
                    mode.id === 'online'
                      ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                      : mode.id === 'offline'
                      ? 'bg-purple-500/10 border-purple-400/30 text-purple-300'
                      : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                  }`}
                >
                  {mode.badge}
                </span>

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-110 transition-all duration-300 ${
                    mode.id === 'online'
                      ? 'bg-cyan-500/10 border-cyan-400/20 text-cyan-400 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_16px_rgba(0,217,255,0.25)]'
                      : mode.id === 'offline'
                      ? 'bg-purple-500/10 border-purple-400/20 text-purple-400 group-hover:border-purple-400/40 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.25)]'
                      : 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400 group-hover:border-emerald-400/40 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                  }`}
                >
                  {mode.id === 'online' && <Video className="w-5 h-5" />}
                  {mode.id === 'offline' && <Building2 className="w-5 h-5" />}
                  {mode.id === 'hybrid' && <Layers className="w-5 h-5" />}
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className={`font-heading text-xl sm:text-2xl font-bold mb-1.5 transition-colors duration-200 min-h-[2rem] ${
                  mode.id === 'online' ? 'text-white group-hover:text-cyan-200' : mode.id === 'offline' ? 'text-white group-hover:text-purple-200' : 'text-white group-hover:text-emerald-200'
                }`}>
                  {mode.title}
                </h3>
                <p className="text-xs sm:text-sm text-cyan-300/90 font-medium leading-snug min-h-[2.5rem]">
                  {mode.tagline}
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[3.5rem]">
                  {mode.description}
                </p>
              </div>

              {/* Quick Logistics Box */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    <strong className="text-white font-medium">Cohort Cap:</strong> {mode.cohortSize}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    <strong className="text-white font-medium">Batch Schedule:</strong> {mode.schedule}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    <strong className="text-white font-medium">Ideal For:</strong> {mode.idealFor}
                  </span>
                </div>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Key Mode Highlights
                </div>
                <ul className="space-y-2">
                  {mode.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          mode.id === 'online'
                            ? 'text-cyan-400'
                            : mode.id === 'offline'
                            ? 'text-purple-400'
                            : 'text-emerald-400'
                        }`}
                      />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 pt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
              <Button
                variant={mode.id === 'offline' ? 'secondary' : 'hero'}
                size="sm"
                className="w-full justify-center group/btn"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />}
                onClick={() => openBookingModal(mode.id)}
              >
                {mode.ctaText}
              </Button>
              <Link to="/contact" className="w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white">
                  {mode.secondaryCtaText || 'Speak with Academic Advisor'}
                </Button>
              </Link>
            </div>
          </CyberCard>
        ))}
      </div>

      {/* 4. UNIVERSAL CORE PILLARS ("WHAT EVERY LEARNER GETS REGARDLESS OF MODE") */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090d19]/90 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-purple-500/[0.06] blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Zero Compromise Standard
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Guaranteed In Every Mode Without Exception
              </h3>
            </div>
            <span className="text-xs text-slate-400 max-w-sm">
              We never treat online learners as secondary. Quality, mentors, and placement referrals remain 100% identical.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {UNIVERSAL_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-cyan-300 font-mono tracking-tight">
                    {pillar.metric}
                  </div>
                  <h4 className="font-heading text-sm font-semibold text-white">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. SIDE-BY-SIDE FEATURE COMPARISON MATRIX */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading text-xl sm:text-3xl font-bold text-foreground">
              Side-by-Side Mode Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Compare key operational and educational dimensions to discover the optimal setup for your lifestyle.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatrix(!showMatrix)}
            rightIcon={<ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMatrix ? 'rotate-180' : ''}`} />}
          >
            {showMatrix ? 'Hide Full Matrix' : 'View Comparison Matrix'}
          </Button>
        </div>

        {showMatrix && (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#090d19]/80 backdrop-blur-md shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="p-4 text-xs font-heading font-semibold text-slate-400 uppercase tracking-wider w-1/4">
                    Dimension
                  </th>
                  <th className="p-4 text-xs font-heading font-bold text-cyan-300 w-1/4 bg-cyan-500/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-400" />
                      100% Live Online
                    </div>
                  </th>
                  <th className="p-4 text-xs font-heading font-bold text-purple-300 w-1/4 bg-purple-500/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      In-Person Campus Lab
                    </div>
                  </th>
                  <th className="p-4 text-xs font-heading font-bold text-emerald-300 w-1/4 bg-emerald-500/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      Hybrid Flex Track
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {COMPARISON_MATRIX.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      row.importance === 'high' ? 'bg-white/[0.01]' : ''
                    }`}
                  >
                    <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                      {row.dimension}
                      {row.importance === 'high' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Key
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300 leading-relaxed bg-cyan-500/[0.01]">
                      {row.online}
                    </td>
                    <td className="p-4 text-slate-300 leading-relaxed bg-purple-500/[0.01]">
                      {row.offline}
                    </td>
                    <td className="p-4 text-slate-300 leading-relaxed bg-emerald-500/[0.01]">
                      {row.hybrid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. INTERACTIVE "FIND YOUR IDEAL MODE" RECOMMENDER WIDGET */}
      <div className="p-6 sm:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#090e1c] via-[#0d1427] to-[#121128] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass className="w-48 h-48 text-cyan-400" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-cyan-400/20 text-cyan-400">
                <Compass className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-semibold">
                Interactive Self-Assessment
              </span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
              Not Sure Which Format Fits You? Take the 10-Second Test
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Answer 2 simple questions to find the perfect delivery mode matching your current schedule and learning style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Question 1: Schedule */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                1. What is your current daily availability?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'working-pro', label: 'Working 9-to-5 (Need Evening / Weekend hours)' },
                  { id: 'full-time', label: 'Full-Time Student / Dedicated Job Seeker (Can commit full days)' },
                  { id: 'hybrid', label: 'College / Hybrid Worker wanting balance and weekend focus' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedSchedule(opt.id as any)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center justify-between ${
                      selectedSchedule === opt.id
                        ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200 shadow-[0_0_12px_rgba(0,217,255,0.1)]'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedSchedule === opt.id && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Learning Style */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-purple-400" />
                2. Where do you focus and retain information best?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'flexible', label: 'Self-paced at my home setup with zero commute time' },
                  { id: 'immersion', label: 'In a dedicated physical lab with in-person mentor desk checks' },
                  { id: 'balanced', label: 'Online lectures during the week + physical weekend hackathons' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStyle(opt.id as any)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center justify-between ${
                      selectedStyle === opt.id
                        ? 'bg-purple-500/15 border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedStyle === opt.id && <Check className="w-4 h-4 text-purple-400 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Result Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
            <div className="space-y-1">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${recommendation.badgeColor}`}>
                {recommendation.badge}
              </span>
              <h4 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Your Best Fit: <span className="text-cyan-300">{recommendation.mode}</span>
              </h4>
              <p className="text-xs text-slate-300 max-w-xl">
                {recommendation.tagline}
              </p>
            </div>

            <Button
              variant="hero"
              size="sm"
              className="shrink-0"
              onClick={() => openBookingModal(recommendation.modeId)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Test-Drive This Mode
            </Button>
          </div>
        </div>
      </div>

      {/* 7. PHYSICAL CAMPUS HUBS & FACILITY TOUR SHOWCASE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading text-xl sm:text-3xl font-bold text-foreground">
              Our Physical Campus Innovation Labs
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Equipped with enterprise developer workstations, fiber gigabit internet, and maker hardware benches.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openBookingModal('offline')}
            rightIcon={<MapPin className="w-3.5 h-3.5 text-primary" />}
          >
            Book Campus Tour
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAMPUS_HUBS.map((hub) => (
            <CyberCard key={hub.id} glow="purple" className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/10 border border-purple-400/20 text-purple-300 font-semibold">
                    {hub.city} Hub
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {hub.seatsAvailable} lab desks open
                  </span>
                </div>

                <div>
                  <h4 className="font-heading text-lg font-bold text-white">
                    {hub.city} — {hub.area}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {hub.address}
                  </p>
                  <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {hub.metroConnectivity}
                  </p>
                </div>

                {/* Lab Amenities Badges */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Campus Facilities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hub.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] border border-white/[0.06] text-slate-300"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lab Highlights */}
                <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-400">
                  {hub.labHighlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06]">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => openBookingModal('offline')}
                >
                  Schedule Visit at {hub.city}
                </Button>
              </div>
            </CyberCard>
          ))}
        </div>
      </div>

      {/* 8. ALUMNI VOICES: ONLINE VS OFFLINE PERSPECTIVES */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <h3 className="font-heading text-xl sm:text-3xl font-bold text-foreground">
            How Students Excelled in Both Formats
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From remote career switchers to campus lab immersion champions, read how learners leveraged each mode to break into high-growth engineering roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LEARNER_TESTIMONIALS_SPLIT.map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#090d19]/80 border border-white/[0.07] flex flex-col justify-between space-y-4 hover:border-white/[0.14] transition-all"
            >
              <div className="space-y-3">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
                  {item.mode}
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center font-heading text-xs font-bold text-white shrink-0">
                  {item.avatarInitial}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-1.5">
          <h3 className="font-heading text-xl sm:text-3xl font-bold text-foreground">
            Frequently Asked Questions About Class Formats
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Clear answers regarding batch switching, missed sessions, hardware, and demo access.
          </p>
        </div>

        <div className="space-y-3">
          {LEARNING_FAQS.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#0b1122] border-cyan-500/30 shadow-md'
                    : 'bg-[#090d19]/60 border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {faq.category}
                    </span>
                    <span className="font-heading text-xs sm:text-sm font-semibold text-white">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 10. SECTION BOTTOM CTA */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0b101e] to-purple-950/40 border border-white/[0.09] text-center space-y-4 shadow-xl">
        <h4 className="font-heading text-lg sm:text-2xl font-bold text-white">
          Still Undecided? Talk 1-on-1 with our Academic Directors
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Book a 15-minute 1-on-1 roadmap session. We will evaluate your technical background, career target, and daily schedule to recommend the optimal learning trajectory.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="hero"
            size="sm"
            onClick={() => openBookingModal('online')}
            rightIcon={<Video className="w-3.5 h-3.5" />}
          >
            Book Free Live Online Demo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openBookingModal('offline')}
            rightIcon={<Building2 className="w-3.5 h-3.5" />}
          >
            Visit a Physical Campus Lab
          </Button>
          <Link to="/contact">
            <Button variant="outline" size="sm">
              Contact Admissions Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      <ClassBookingDialog
        isOpen={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        defaultMode={bookingDefaultMode}
      />
    </section>
  );
};
