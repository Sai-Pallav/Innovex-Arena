import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  BookOpen,
  ArrowRight,
  Layout,
  Brain,
  Cloud,
  Radio,
  Shield,
  BarChart3,
  Users,
  Cpu,
  Blocks,
  Glasses,
  Target,
  Lightbulb,
  Zap,
  Award,
  FileText,
  MessageSquare,
  FolderGit2,
  Briefcase,
  Calendar,
  MapPin,
} from 'lucide-react';
import { SERVICE_SECTIONS, PAST_EVENTS_DATA } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { LearningModesSection } from '../components/modules/LearningModesSection';
import { useScrollReveal } from '../hooks/useScrollReveal';

const getPillarIcon = (iconName: string, glow: 'cyan' | 'purple') => {
  const iconColor = glow === 'cyan' ? 'text-cyan-400' : 'text-purple-400';
  switch (iconName) {
    case 'Trophy':
      return <Trophy className={`w-5 h-5 ${iconColor}`} />;
    case 'Target':
      return <Target className={`w-5 h-5 ${iconColor}`} />;
    case 'Lightbulb':
      return <Lightbulb className={`w-5 h-5 ${iconColor}`} />;
    case 'Zap':
      return <Zap className={`w-5 h-5 ${iconColor}`} />;
    case 'BookOpen':
      return <BookOpen className={`w-5 h-5 ${iconColor}`} />;
    case 'Award':
      return <Award className={`w-5 h-5 ${iconColor}`} />;
    case 'FileText':
      return <FileText className={`w-5 h-5 ${iconColor}`} />;
    case 'MessageSquare':
      return <MessageSquare className={`w-5 h-5 ${iconColor}`} />;
    case 'FolderGit2':
      return <FolderGit2 className={`w-5 h-5 ${iconColor}`} />;
    case 'Briefcase':
      return <Briefcase className={`w-5 h-5 ${iconColor}`} />;
    case 'Layout':
      return <Layout className={`w-5 h-5 ${iconColor}`} />;
    case 'Brain':
      return <Brain className={`w-5 h-5 ${iconColor}`} />;
    case 'Cloud':
      return <Cloud className={`w-5 h-5 ${iconColor}`} />;
    case 'Radio':
      return <Radio className={`w-5 h-5 ${iconColor}`} />;
    case 'Cpu':
      return <Cpu className={`w-5 h-5 ${iconColor}`} />;
    case 'Shield':
      return <Shield className={`w-5 h-5 ${iconColor}`} />;
    case 'BarChart3':
      return <BarChart3 className={`w-5 h-5 ${iconColor}`} />;
    case 'Blocks':
      return <Blocks className={`w-5 h-5 ${iconColor}`} />;
    case 'Glasses':
      return <Glasses className={`w-5 h-5 ${iconColor}`} />;
    default:
      return <Cpu className={`w-5 h-5 ${iconColor}`} />;
  }
};

interface ServicePillarSectionProps {
  section: (typeof SERVICE_SECTIONS)[number];
  glow: 'cyan' | 'purple';
}

const ServicePillarSection: React.FC<ServicePillarSectionProps> = ({ section, glow }) => {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [hoverReady, setHoverReady] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setHoverReady(true);
      }, section.items.length * 80 + 700);
      return () => clearTimeout(timer);
    }
  }, [isVisible, section.items.length]);

  return (
    <section id={section.id} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-28">
      {/* 100% STATIC TITLE & DESCRIPTION - DOES NOT MOVE DURING REVEAL */}
      <div className="text-center space-y-1.5 max-w-2xl mx-auto">
        <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
          {section.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {section.description}
        </p>
      </div>

      {/* DYNAMIC SCROLL REVEAL CARDS WITH INDEPENDENT DELAYS */}
      <div
        ref={ref}
        className={`grid gap-5 sm:gap-6 items-stretch ${
          section.items.length > 4
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : section.items.length === 4
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {section.items.map((item, idx) => (
          <div
            key={idx}
            className={`scroll-reveal-card h-full flex flex-col ${
              isVisible ? 'revealed' : ''
            } ${hoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: isVisible ? `${idx * 80}ms` : '0ms',
            }}
          >
            <CyberCard
              glow={glow}
              hoverEffect={hoverReady}
              className="p-5 sm:p-6 group flex flex-col justify-between h-full"
            >
              <div className="flex-1 flex flex-col">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 group-hover:scale-110 transition-all duration-300 ${
                    glow === 'cyan'
                      ? 'bg-cyan-500/[0.08] border border-cyan-400/20 text-cyan-400 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/15 group-hover:shadow-[0_0_16px_rgba(0,217,255,0.2)]'
                      : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:border-purple-400/40 group-hover:bg-purple-500/15 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.25)]'
                  }`}
                >
                  {getPillarIcon(item.iconName, glow)}
                </div>
                <h3
                  className={`font-heading text-base sm:text-lg font-semibold text-white transition-colors duration-200 mb-1.5 leading-snug min-h-[1.75rem] ${
                    glow === 'cyan'
                      ? 'group-hover:text-cyan-200'
                      : 'group-hover:text-purple-200'
                  }`}
                >
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[2.5rem]">
                  {item.description}
                </p>
              </div>
            </CyberCard>
          </div>
        ))}
      </div>
    </section>
  );
};

const PastEventsSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [hoverReady, setHoverReady] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setHoverReady(true);
      }, PAST_EVENTS_DATA.length * 80 + 700);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-28">
      {/* STATIC TITLE & DESCRIPTION */}
      <div className="text-center space-y-1.5 max-w-2xl mx-auto">
        <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
          Past <span className="text-gradient-cyan">Workshops & Events</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          A look back at our successful events and training programs.
        </p>
      </div>

      <div
        ref={ref}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch"
      >
        {PAST_EVENTS_DATA.map((evt, i) => (
          <div
            key={i}
            className={`scroll-reveal-card h-full flex flex-col ${
              isVisible ? 'revealed' : ''
            } ${hoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: isVisible ? `${i * 90}ms` : '0ms',
            }}
          >
            <CyberCard
              glow="purple"
              hoverEffect={hoverReady}
              className="p-5 sm:p-6 flex flex-col justify-between group h-full"
            >
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading text-base font-semibold text-white group-hover:text-purple-200 transition-colors duration-200 line-clamp-2 min-h-[2.75rem] sm:min-h-[3rem] mb-1">
                    {evt.title}
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-purple-400/25 group-hover:bg-white/[0.04] transition-all duration-300 space-y-2 text-xs text-slate-300 min-h-[5.5rem] flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{evt.attendees}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>
            </CyberCard>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ServicesPage: React.FC = () => {
  return (
    <div className="relative pb-20">
      {/* Ambient Backdrop Spotlight matching HomePage */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] ambient-glow-hero pointer-events-none -z-10" />

      <div className="pt-20 sm:pt-24 lg:pt-24 space-y-20 sm:space-y-28">
        {/* 1. HERO (EXACT LIVE SITE COPY - REFINED CLEAN & PROFESSIONAL) */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-3.5 sm:space-y-4 animate-fade-up">
          <div className="space-y-1.5">
            <h1 className="font-heading font-semibold text-3xl sm:text-5xl lg:text-[3.6rem] tracking-[-0.02em] text-white leading-[1.14]">
              Our <span className="text-gradient-cyan">Services</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Empowering individuals and organizations with cutting-edge technology education, hands-on workshops, and innovation programs.
            </p>
          </div>
        </section>

        {/* 2. FOUR CORE SECTIONS MATCHING LIVE SITE PILLARS WITH DECOUPLED CARD REVEALS */}
        {SERVICE_SECTIONS.map((section, idx) => (
          <ServicePillarSection
            key={section.id}
            section={section}
            glow={idx % 2 === 0 ? 'cyan' : 'purple'}
          />
        ))}

        {/* 3. ONLINE & OFFLINE CLASSES CURRICULUM OVERVIEW */}
        <section className="border-t border-white/[0.06] pt-16">
          <LearningModesSection />
        </section>

        {/* 4. PAST EVENTS & WORKSHOPS (EXACT LIVE SITE SECTION) */}
        <PastEventsSection />

        {/* 5. SERVICES CTA (EXACT LIVE SITE COPY - REFINED CLEAN & PROFESSIONAL) */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-white/[0.07] bg-[#0b101e]/75 backdrop-blur-xl shadow-2xl text-center space-y-4 transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(0,217,255,0.08)] group">
            <div className="shimmer-hairline opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.04] via-transparent to-purple-500/[0.04] pointer-events-none" />
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
              Ready to <span className="text-gradient-cyan">Get Started?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Contact us to discuss how we can help you or your organization achieve your technology goals.
            </p>
            <div className="pt-2">
              <Link to="/contact">
                <Button
                  variant="hero"
                  size="md"
                  className="group/btn"
                  rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />}
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
