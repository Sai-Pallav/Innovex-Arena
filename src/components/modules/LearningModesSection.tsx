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
        <h2 className="font-rebond font-medium text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
          Master Tech Your Way: <br className="hidden sm:inline" />
          <span className="cosmic-text-gradient">
            Online, Offline Campus, or Hybrid
          </span>
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-[#9b96b0] leading-relaxed max-w-2xl mx-auto">
          Whether you learn from your home desk with global peers or code side-by-side with mentors in our physical campus labs, you get the exact same industry-grade syllabus, real-world capstones, and tier-1 hiring network.
        </p>
      </div>

      {/* 2. MODE SELECTOR TABS - Wope 999px Glass Pills */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] backdrop-blur-md gap-1.5 max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white/[0.08] text-white font-medium border border-[#9382ff]/50 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.18),0_0_15px_rgba(147,130,255,0.2)]'
                : 'text-[#9b96b0] border border-transparent hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            All Formats ({LEARNING_MODES.length})
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'online'
                ? 'bg-white/[0.08] text-white font-medium border border-[#9382ff]/50 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.18),0_0_15px_rgba(147,130,255,0.2)]'
                : 'text-[#9b96b0] border border-transparent hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#b7a4fb]" />
            100% Live Online
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'offline'
                ? 'bg-white/[0.08] text-white font-medium border border-[#9382ff]/50 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.18),0_0_15px_rgba(147,130,255,0.2)]'
                : 'text-[#9b96b0] border border-transparent hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#ba9cff]" />
            In-Person Campus Lab
          </button>
          <button
            onClick={() => setActiveTab('hybrid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === 'hybrid'
                ? 'bg-white/[0.08] text-white font-medium border border-[#9382ff]/50 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.18),0_0_15px_rgba(147,130,255,0.2)]'
                : 'text-[#9b96b0] border border-transparent hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#b7a4fb]" />
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
                  className="px-3 py-0.5 rounded-full text-[10px] font-mono uppercase font-medium tracking-wider bg-white/[0.04] border border-white/[0.12] text-[#b7a4fb] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]"
                >
                  {mode.badge}
                </span>

                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/[0.04] border border-white/[0.12] text-[#b7a4fb] group-hover:scale-110 group-hover:border-[#9382ff]/60 group-hover:shadow-[0_0_16px_rgba(147,130,255,0.25)] transition-all duration-300"
                >
                  {mode.id === 'online' && <Video className="w-5 h-5 text-[#b7a4fb]" />}
                  {mode.id === 'offline' && <Building2 className="w-5 h-5 text-[#ba9cff]" />}
                  {mode.id === 'hybrid' && <Layers className="w-5 h-5 text-[#b7a4fb]" />}
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="font-rebond text-xl sm:text-2xl font-medium mb-1.5 transition-colors duration-200 min-h-[2rem] text-white group-hover:text-[#b7a4fb]">
                  {mode.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#b7a4fb] font-medium leading-snug min-h-[2.5rem]">
                  {mode.tagline}
                </p>
                <p className="text-xs text-[#9b96b0] mt-2 leading-relaxed min-h-[3.5rem]">
                  {mode.description}
                </p>
              </div>

              {/* Quick Logistics Box */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs text-[#9b96b0]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                  <span>
                    <strong className="text-white font-medium">Cohort Cap:</strong> {mode.cohortSize}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                  <span>
                    <strong className="text-white font-medium">Batch Schedule:</strong> {mode.schedule}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                  <span>
                    <strong className="text-white font-medium">Ideal For:</strong> {mode.idealFor}
                  </span>
                </div>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#9b96b0]">
                  Key Mode Highlights
                </div>
                <ul className="space-y-2">
                  {mode.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#9b96b0] leading-normal">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0 mt-0.5 text-[#b7a4fb]"
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
                <Button variant="ghost" size="sm" className="w-full text-xs text-[#9b96b0] hover:text-white">
                  {mode.secondaryCtaText || 'Speak with Academic Advisor'}
                </Button>
              </Link>
            </div>
          </CyberCard>
        ))}
      </div>

      {/* 4. UNIVERSAL CORE PILLARS */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0118] border border-white/[0.12] shadow-[inset_0_0_24px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="aurora-divider-line absolute top-0 left-0 right-0" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#713dff]/[0.08] blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#b7a4fb] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#b7a4fb]" />
                Zero Compromise Standard
              </span>
              <h3 className="font-rebond text-xl sm:text-2xl font-medium text-white tracking-tight">
                Guaranteed In Every Mode Without Exception
              </h3>
            </div>
            <span className="text-xs text-[#9b96b0] max-w-sm">
              We never treat online learners as secondary. Quality, mentors, and placement referrals remain 100% identical.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {UNIVERSAL_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#9382ff]/30 transition-colors space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-[#b7a4fb] font-mono tracking-tight">
                    {pillar.metric}
                  </div>
                  <h4 className="font-rebond text-sm font-medium text-white">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-[#9b96b0] leading-relaxed">
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
            <h3 className="font-rebond text-xl sm:text-3xl font-medium text-white tracking-tight">
              Side-by-Side Mode Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-[#9b96b0]">
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
          <div className="overflow-x-auto rounded-2xl border border-white/[0.12] bg-[#0a0118] backdrop-blur-md shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="p-4 text-xs font-rebond font-medium text-[#9b96b0] uppercase tracking-wider w-1/4">
                    Dimension
                  </th>
                  <th className="p-4 text-xs font-rebond font-medium text-[#b7a4fb] w-1/4 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#b7a4fb]" />
                      100% Live Online
                    </div>
                  </th>
                  <th className="p-4 text-xs font-rebond font-medium text-[#ba9cff] w-1/4 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#ba9cff]" />
                      In-Person Campus Lab
                    </div>
                  </th>
                  <th className="p-4 text-xs font-rebond font-medium text-[#b7a4fb] w-1/4 bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#b7a4fb]" />
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
                    <td className="p-4 font-medium text-white flex items-center gap-2">
                      {row.dimension}
                      {row.importance === 'high' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/[0.04] text-[#b7a4fb] border border-white/[0.1]">
                          Key
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-[#9b96b0] leading-relaxed">
                      {row.online}
                    </td>
                    <td className="p-4 text-[#9b96b0] leading-relaxed">
                      {row.offline}
                    </td>
                    <td className="p-4 text-[#9b96b0] leading-relaxed">
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
      <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.12] bg-[#0a0118] shadow-[inset_0_0_24px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="aurora-divider-line absolute top-0 left-0 right-0" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass className="w-48 h-48 text-[#b7a4fb]" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] text-[#b7a4fb]">
                <Compass className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-[#b7a4fb] font-medium">
                Interactive Self-Assessment
              </span>
            </div>
            <h3 className="font-rebond text-xl sm:text-2xl font-medium text-white tracking-tight">
              Not Sure Which Format Fits You? Take the 10-Second Test
            </h3>
            <p className="text-xs sm:text-sm text-[#9b96b0] max-w-2xl">
              Answer 2 simple questions to find the perfect delivery mode matching your current schedule and learning style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Question 1: Schedule */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-[#9b96b0] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#b7a4fb]" />
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
                    className={`w-full text-left p-3.5 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      selectedSchedule === opt.id
                        ? 'bg-white/[0.08] border-[#9382ff]/60 text-white shadow-[inset_0_-7px_11px_rgba(164,143,255,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] text-[#9b96b0] hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedSchedule === opt.id && <Check className="w-4 h-4 text-[#b7a4fb] shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Learning Style */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-[#9b96b0] flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-[#ba9cff]" />
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
                    className={`w-full text-left p-3.5 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      selectedStyle === opt.id
                        ? 'bg-white/[0.08] border-[#9382ff]/60 text-white shadow-[inset_0_-7px_11px_rgba(164,143,255,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.08] text-[#9b96b0] hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedStyle === opt.id && <Check className="w-4 h-4 text-[#ba9cff] shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Result Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/[0.04] border border-white/[0.12] text-[#b7a4fb] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
                {recommendation.badge}
              </span>
              <h4 className="font-rebond text-base sm:text-lg font-medium text-white flex items-center gap-2">
                Your Best Fit: <span className="cosmic-text-gradient">{recommendation.mode}</span>
              </h4>
              <p className="text-xs text-[#9b96b0] max-w-xl">
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
            <h3 className="font-rebond text-xl sm:text-3xl font-medium text-white tracking-tight">
              Our Physical Campus Innovation Labs
            </h3>
            <p className="text-xs sm:text-sm text-[#9b96b0]">
              Equipped with enterprise developer workstations, fiber gigabit internet, and maker hardware benches.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openBookingModal('offline')}
            rightIcon={<MapPin className="w-3.5 h-3.5 text-[#b7a4fb]" />}
          >
            Book Campus Tour
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAMPUS_HUBS.map((hub) => (
            <CyberCard key={hub.id} glow="purple" className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.04] border border-white/[0.12] text-[#ba9cff] font-medium">
                    {hub.city} Hub
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {hub.seatsAvailable} lab desks open
                  </span>
                </div>

                <div>
                  <h4 className="font-rebond text-lg font-medium text-white">
                    {hub.city} — {hub.area}
                  </h4>
                  <p className="text-xs text-[#9b96b0] mt-1 leading-relaxed">
                    {hub.address}
                  </p>
                  <p className="text-[11px] text-[#b7a4fb] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {hub.metroConnectivity}
                  </p>
                </div>

                {/* Lab Amenities Badges */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#9b96b0]">
                    Campus Facilities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hub.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-[10px] bg-white/[0.04] border border-white/[0.1] text-[#9b96b0]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lab Highlights */}
                <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] text-[#9b96b0]">
                  {hub.labHighlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#b7a4fb] shrink-0" />
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
          <h3 className="font-rebond text-xl sm:text-3xl font-medium text-white tracking-tight">
            How Students Excelled in Both Formats
          </h3>
          <p className="text-xs sm:text-sm text-[#9b96b0] max-w-xl mx-auto">
            From remote career switchers to campus lab immersion champions, read how learners leveraged each mode to break into high-growth engineering roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LEARNER_TESTIMONIALS_SPLIT.map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#0a0118] border border-white/[0.12] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex flex-col justify-between space-y-4 hover:border-[#9382ff]/40 transition-all"
            >
              <div className="space-y-3">
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] border border-white/[0.12] text-[#b7a4fb]">
                  {item.mode}
                </span>
                <p className="text-xs sm:text-sm text-[#9b96b0] leading-relaxed italic">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center font-rebond text-xs font-medium text-white shrink-0">
                  {item.avatarInitial}
                </div>
                <div>
                  <h4 className="font-rebond text-xs font-medium text-white">{item.name}</h4>
                  <p className="text-[10px] text-[#9b96b0]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-1.5">
          <h3 className="font-rebond text-xl sm:text-3xl font-medium text-white tracking-tight">
            Frequently Asked Questions About Class Formats
          </h3>
          <p className="text-xs sm:text-sm text-[#9b96b0]">
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
                    ? 'bg-[#0a0118] border-[#9382ff]/40 shadow-[inset_0_0_20px_rgba(147,130,255,0.08)]'
                    : 'bg-[#0a0118]/80 border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-[#9b96b0] border border-white/[0.08]">
                      {faq.category}
                    </span>
                    <span className="font-rebond text-xs sm:text-sm font-medium text-white">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9b96b0] shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#b7a4fb]' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-[#9b96b0] leading-relaxed border-t border-white/[0.06]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 10. SECTION BOTTOM CTA */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-[#0a0118] border border-white/[0.12] shadow-[inset_0_0_24px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.8)] text-center space-y-4 overflow-hidden">
        <div className="aurora-divider-line absolute top-0 left-0 right-0" />
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#9382ff]/50 to-transparent pointer-events-none" />

        <h4 className="font-rebond text-lg sm:text-2xl font-medium text-white tracking-tight">
          Still Undecided? Talk 1-on-1 with our Academic Directors
        </h4>
        <p className="text-xs sm:text-sm text-[#9b96b0] max-w-xl mx-auto leading-relaxed">
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
