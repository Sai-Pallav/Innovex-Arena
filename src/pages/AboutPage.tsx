import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Eye,
  Target,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Star,
  Users,
  Code,
  GraduationCap,
  Cpu,
  Video,
  Building2,
  Layers,
  Briefcase,
  Rocket,
  Sparkles,
  Layout,
  Brain,
  Cloud,
  Trophy,
  Mail,
  Send,
  Award,
  Laptop,
  Terminal,
  Globe,
  Zap,
} from 'lucide-react';
import {
  HERO_DATA,
  VISION_MISSION,
  CORE_SERVICES_HOME,
  PRODUCTS,
  EVENTS_DATA,
  JOB_POSITIONS,
  INTERN_POSITIONS,
  TESTIMONIALS,
  CAREER_PERKS,
} from '../data/siteData';
import { LEARNING_MODES } from '../data/learningModesData';
import { EventRegistrationDialog } from '../components/modules/EventRegistrationDialog';
import { ClassBookingDialog } from '../components/modules/ClassBookingDialog';
import { TestimonialsInfiniteMarquee } from '../components/modules/TestimonialsInfiniteMarquee';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { EventItem, LearningModeType } from '../types';
import { useToast } from '../components/ui/Toast';
import { AboutAtmosphere } from '../components/layout/AboutAtmosphere';

export const AboutPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDefaultMode, setBookingDefaultMode] = useState<LearningModeType>('online');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const { ref: visionMissionRef, isVisible: visionMissionVisible } = useScrollReveal({
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  const { ref: aboutCardsRef, isVisible: aboutCardsVisible } = useScrollReveal({
    threshold: 0.06,
    rootMargin: '0px 0px -45px 0px',
  });

  const visionMissionHoverReady = true;
  const aboutCardsHoverReady = true;

  // 3. Our Services section reveal
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const servicesHoverReady = true;

  // 4. Products section reveal
  const { ref: productsRef, isVisible: productsVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const productsHoverReady = true;

  // 5. Classes section reveal
  const { ref: classesRef, isVisible: classesVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const classesHoverReady = true;

  // 6. Events section reveal
  const { ref: eventsRef, isVisible: eventsVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const eventsHoverReady = true;

  // 7. Career Perks
  const { ref: perksRef, isVisible: perksVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const perksHoverReady = true;

  // 8. Open Positions & Internships
  const { ref: positionsRef, isVisible: positionsVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const positionsHoverReady = true;

  const openBookingModal = (mode: LearningModeType) => {
    setBookingDefaultMode(mode);
    setBookingDialogOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      toast({
        title: 'Successfully Subscribed',
        description: 'Thank you for joining our observatory dispatch.',
        variant: 'success',
      });
      setNewsletterEmail('');
    }, 500);
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout':
        return <Layout className="w-5 h-5 stroke-[1.5] text-[#f4f0ff]" />;
      case 'Brain':
        return <Brain className="w-5 h-5 stroke-[1.5] text-[#f4f0ff]" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 stroke-[1.5] text-[#f4f0ff]" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 stroke-[1.5] text-[#f4f0ff]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 stroke-[1.5] text-[#f4f0ff]" />;
      case 'Users':
        return <Users className="w-5 h-5 stroke-[1.5] text-[#f4f0ff]" />;
      default:
        return <Code className="w-5 h-5 stroke-[1.5] text-[#f4f0ff]" />;
    }
  };

  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 stroke-[1.5] text-[#f4f0ff]" />;
      case 'Users':
        return <Users className="w-4 h-4 stroke-[1.5] text-[#9382ff]" />;
      case 'Code':
        return <Code className="w-4 h-4 stroke-[1.5] text-[#f4f0ff]" />;
      case 'Award':
        return <Award className="w-4 h-4 stroke-[1.5] text-[#9382ff]" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4 stroke-[1.5] text-[#f4f0ff]" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 stroke-[1.5] text-[#9382ff]" />;
      default:
        return <Sparkles className="w-4 h-4 stroke-[1.5] text-[#f4f0ff]" />;
    }
  };

  return (
    <div className="home-cosmos-theme relative min-h-screen bg-[#030014] text-[#f4f0ff] pb-24 overflow-hidden selection:bg-[#5046e4]/40 selection:text-white">
      {/* ATMOSPHERIC BACKGROUND LAYERS */}
      <AboutAtmosphere />

      {/* 1. ABOUT HERO SECTION */}
      <section
        id="about-hero"
        className="relative z-10 pt-32 pb-20 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto text-center flex flex-col items-center"
      >
        {/* AI Badge Pill (Reflect: 32px radius, #060317 bg, #5046e4 border, inset violet glow) */}
        <div className="reflect-ai-badge mb-8 cursor-default group">
          <Sparkles className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <span>About Innovex Arena // Mission & Philosophy</span>
        </div>

        {/* Display Headline — AeonikPro / Sora 500 (Deliberately medium, not bold) */}
        <h1 className="font-aeonik font-medium text-4xl sm:text-6xl lg:text-7xl tracking-[-0.035em] text-[#f4f0ff] leading-[1.12] max-w-4xl mx-auto mb-6">
          Architecting Intelligence for{' '}
          <span className="cosmic-text-gradient font-medium">
            Next-Gen Creators
          </span>
        </h1>

        {/* Editorial Subtitle — Inter V 400 at 18px, #a8a6b7 */}
        <p className="text-base sm:text-lg text-[#a8a6b7] max-w-2xl mx-auto font-normal leading-[1.56] mb-10">
          We are a technology incubator building AI systems, cloud-native architectures, and immersive engineering cohorts designed to turn ambitious developers into world-class builders.
        </p>

        {/* Primary & Secondary Action Buttons (Reflect 5px Radius Spec) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16">
          <Link to="/services" className="reflect-primary-btn group">
            <span>Explore Capabilities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/events" className="reflect-ghost-btn group">
            <span>Upcoming Hackathons</span>
            <ChevronRight className="w-4 h-4 text-[#918ea0] group-hover:text-[#f4f0ff] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Stats Grid: 16px Radius Midnight Surface Cards with Inset Rim Glow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
          {HERO_DATA.stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-[16px] bg-[#060317] border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] py-6 px-4 text-center space-y-1 group hover:border-[#9382ff]/30 transition-colors"
            >
              <div className="font-aeonik font-medium text-3xl sm:text-4xl text-[#f4f0ff] tracking-tight inline-block">
                <AnimatedCounter value={stat.value} duration={2000} delay={i * 80} />
              </div>
              <div className="text-xs text-[#a8a6b7] font-normal tracking-normal">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 2. VISION & MISSION SECTION */}
      <section id="vision-mission" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="reflect-ai-badge">
            <Target className="w-3.5 h-3.5 text-[#9382ff]" />
            <span>Foundational Blueprint</span>
          </div>
          <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em]">
            Vision & Mission
          </h2>
          <p className="text-base text-[#918ea0] max-w-xl mx-auto font-normal leading-relaxed">
            Pioneering technology innovation and empowering the next generation of engineers through experiential building.
          </p>
        </div>

        <div
          ref={visionMissionRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          {/* Vision Card */}
          <div
            className={`scroll-reveal-left h-full flex flex-col ${
              visionMissionVisible ? 'revealed' : ''
            } ${visionMissionHoverReady ? 'hover-ready' : ''}`}
          >
            <div className="rounded-[16px] bg-[#060317] p-8 sm:p-10 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between group hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[5px] bg-[#10093a] border border-white/[0.08] flex items-center justify-center text-[#b7a4fb] shrink-0">
                    <Eye className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="font-aeonik text-xl sm:text-2xl font-medium text-[#f4f0ff]">
                    {VISION_MISSION.vision.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-[#a8a6b7] leading-relaxed font-normal">
                  {VISION_MISSION.vision.description}
                </p>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div
            className={`scroll-reveal-right h-full flex flex-col ${
              visionMissionVisible ? 'revealed' : ''
            } ${visionMissionHoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: visionMissionVisible ? '120ms' : '0ms',
            }}
          >
            <div className="rounded-[16px] bg-[#060317] p-8 sm:p-10 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between group hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[5px] bg-[#10093a] border border-white/[0.08] flex items-center justify-center text-[#9382ff] shrink-0">
                    <Target className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="font-aeonik text-xl sm:text-2xl font-medium text-[#f4f0ff]">
                    {VISION_MISSION.mission.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {VISION_MISSION.mission.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-[#a8a6b7] font-normal leading-normal">
                      <CheckCircle2 className="w-4 h-4 text-[#9382ff] shrink-0 mt-1 stroke-[1.5]" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 3. CORE PILLARS & SERVICES (REFLECT NOTES MINIMAL FEATURE SPEC) */}
      <section id="services" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="reflect-ai-badge">
            <Cpu className="w-3.5 h-3.5 text-[#b7a4fb]" />
            <span>Architectural Capabilities</span>
          </div>
          <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em]">
            What We Engineer & Deliver
          </h2>
          <p className="text-base text-[#918ea0] max-w-xl mx-auto font-normal leading-relaxed">
            Full-spectrum software infrastructure, practical developer education, and real-world incubation.
          </p>
        </div>

        <div
          ref={aboutCardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          {CORE_SERVICES_HOME.map((srv, idx) => (
            <div
              key={idx}
              className={`scroll-reveal-card h-full flex flex-col ${
                aboutCardsVisible ? 'revealed' : ''
              } ${aboutCardsHoverReady ? 'hover-ready' : ''}`}
              style={{
                transitionDelay: aboutCardsVisible ? `${idx * 80}ms` : '0ms',
              }}
            >
              <div className="rounded-[16px] bg-[#060317] p-7 sm:p-8 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] group flex flex-col justify-between h-full hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="w-10 h-10 rounded-[5px] bg-[#10093a] border border-white/[0.08] flex items-center justify-center text-[#f4f0ff]">
                    {getServiceIcon(srv.iconName)}
                  </div>
                  <h3 className="font-aeonik text-lg sm:text-xl font-medium text-[#f4f0ff] leading-snug">
                    {srv.title}
                  </h3>
                  <p className="text-sm text-[#a8a6b7] leading-relaxed font-normal">
                    {srv.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9382ff] hover:text-[#f4f0ff] transition-colors"
                  >
                    <span>Explore service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 4. PROPRIETARY PRODUCTS SHOWCASE */}
      <section id="products" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto space-y-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="reflect-ai-badge mb-2">
              <Zap className="w-3.5 h-3.5 text-[#9382ff]" />
              <span>Proprietary Technology</span>
            </div>
            <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em]">
              Innovation Labs Products
            </h2>
            <p className="text-base text-[#918ea0] max-w-xl font-normal leading-relaxed">
              Intelligent software systems built with cutting-edge multi-agent AI and distributed cloud topologies.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9382ff] hover:text-[#f4f0ff] transition-colors"
          >
            <span>View All Software</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div ref={productsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className={`scroll-reveal-card h-full flex flex-col ${
                productsVisible ? 'revealed' : ''
              } ${productsHoverReady ? 'hover-ready' : ''}`}
            >
              <div className="rounded-[16px] bg-[#060317] p-7 sm:p-8 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex flex-col justify-between group h-full hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#9382ff] px-2 py-0.5 rounded-[5px] bg-[#10093a] border border-white/[0.06]">
                      {prod.badge || 'PROD'}
                    </span>
                    <span className="text-xs font-mono text-[#918ea0]">{prod.category}</span>
                  </div>

                  <h3 className="font-aeonik text-xl font-medium text-[#f4f0ff] group-hover:text-[#b7a4fb] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[#b7a4fb] font-medium leading-snug">
                    {prod.tagline}
                  </p>
                  <p className="text-sm text-[#a8a6b7] line-clamp-3 leading-relaxed font-normal">
                    {prod.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {prod.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-[5px] text-[11px] font-mono bg-white/[0.03] border border-white/[0.06] text-[#cdccd0]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-[#918ea0] font-mono">Status: Production</span>
                  <Link
                    to="/products"
                    className="reflect-primary-btn text-xs py-2 px-3.5 group/btn"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 5. LEARNING MODES & COHORTS */}
      <section id="classes" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto space-y-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="reflect-ai-badge mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#b7a4fb]" />
              <span>Learning Formats</span>
            </div>
            <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em]">
              Online & Campus Cohorts
            </h2>
            <p className="text-base text-[#918ea0] max-w-xl font-normal leading-relaxed">
              Tailored delivery formats: interactive digital classes or in-person technical labs with veteran industry mentors.
            </p>
          </div>
          <Link
            to="/classes"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9382ff] hover:text-[#f4f0ff] transition-colors"
          >
            <span>Compare Curriculums</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div ref={classesRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {LEARNING_MODES.map((mode) => (
            <div
              key={mode.id}
              className={`scroll-reveal-card h-full flex flex-col ${
                classesVisible ? 'revealed' : ''
              } ${classesHoverReady ? 'hover-ready' : ''}`}
            >
              <div className="rounded-[16px] bg-[#060317] p-7 sm:p-8 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex flex-col justify-between group h-full hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="w-10 h-10 rounded-[5px] bg-[#10093a] border border-white/[0.08] flex items-center justify-center text-[#f4f0ff]">
                    {mode.id === 'online' && <Video className="w-5 h-5 stroke-[1.5]" />}
                    {mode.id === 'offline' && <Building2 className="w-5 h-5 stroke-[1.5]" />}
                    {mode.id === 'hybrid' && <Layers className="w-5 h-5 stroke-[1.5]" />}
                  </div>

                  <div>
                    <h3 className="font-aeonik text-xl font-medium text-[#f4f0ff] mb-1">
                      {mode.title}
                    </h3>
                    <p className="text-xs text-[#b7a4fb] font-medium">
                      {mode.tagline}
                    </p>
                    <p className="text-sm text-[#a8a6b7] mt-2.5 line-clamp-3 leading-relaxed font-normal">
                      {mode.description}
                    </p>
                  </div>

                  <div className="space-y-2 py-3 border-y border-white/[0.06] my-2 text-xs text-[#a8a6b7]">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#9382ff] shrink-0" />
                      <span>{mode.cohortSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                      <span className="truncate">{mode.schedule}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-3">
                  <button
                    type="button"
                    className="reflect-primary-btn flex-1 text-xs py-2 px-3 justify-center"
                    onClick={() => openBookingModal(mode.id)}
                  >
                    {mode.id === 'offline' ? 'Book Lab Visit' : 'Schedule Demo'}
                  </button>
                  <Link to="/classes" className="reflect-ghost-btn text-xs py-2 px-3">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 6. UPCOMING EVENTS & WORKSHOPS */}
      <section id="events" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto space-y-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="reflect-ai-badge mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#9382ff]" />
              <span>Event Calendar</span>
            </div>
            <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em]">
              Upcoming Hackathons & Talks
            </h2>
            <p className="text-base text-[#918ea0] max-w-xl font-normal leading-relaxed">
              Participate in live architectural workshops, tech speaker summits, and developer hackathons.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9382ff] hover:text-[#f4f0ff] transition-colors"
          >
            <span>All Events Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div ref={eventsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {EVENTS_DATA.slice(0, 3).map((evt) => (
            <div
              key={evt.id}
              className={`scroll-reveal-card h-full flex flex-col ${
                eventsVisible ? 'revealed' : ''
              } ${eventsHoverReady ? 'hover-ready' : ''}`}
            >
              <div className="rounded-[16px] bg-[#060317] p-7 sm:p-8 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex flex-col justify-between group h-full hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#9382ff] uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className="text-xs font-mono text-[#918ea0]">{evt.mode}</span>
                  </div>

                  <h3 className="font-aeonik text-xl font-medium text-[#f4f0ff] line-clamp-2">
                    {evt.title}
                  </h3>

                  <p className="text-sm text-[#a8a6b7] line-clamp-3 leading-relaxed font-normal">
                    {evt.description}
                  </p>

                  <div className="space-y-2 py-3 border-y border-white/[0.06] my-2 text-xs text-[#a8a6b7]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                      <span className="text-[#f4f0ff] font-medium">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#b7a4fb] shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <button
                    type="button"
                    className="reflect-primary-btn w-full text-xs py-2.5 justify-center"
                    onClick={() => setSelectedEvent(evt)}
                  >
                    Register for Event
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 7. CAREERS & OPPORTUNITIES */}
      <section id="careers-internships" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="reflect-ai-badge">
            <Briefcase className="w-3.5 h-3.5 text-[#9382ff]" />
            <span>Opportunities</span>
          </div>
          <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em]">
            Build Your Career With Us
          </h2>
          <p className="text-base text-[#918ea0] max-w-xl mx-auto font-normal leading-relaxed">
            Work on real-world AI systems, gain guidance from senior architects, and launch your engineering trajectory.
          </p>
        </div>

        {/* 6 Perks in 16px cards */}
        <div
          ref={perksRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {CAREER_PERKS.map((perk, i) => (
            <div
              key={i}
              className={`p-5 rounded-[16px] bg-[#060317] border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] text-center space-y-2 flex flex-col justify-between hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer ${
                perksVisible ? 'revealed' : ''
              } ${perksHoverReady ? 'hover-ready' : ''}`}
              style={{
                transitionDelay: perksVisible ? `${i * 60}ms` : '0ms',
              }}
            >
              <div className="w-8 h-8 mx-auto rounded-[5px] bg-[#10093a] border border-white/[0.06] flex items-center justify-center text-[#f4f0ff]">
                {getPerkIcon(perk.iconName)}
              </div>
              <div className="font-aeonik font-medium text-xs text-[#f4f0ff]">
                {perk.title}
              </div>
              <div className="text-[11px] text-[#a8a6b7] leading-tight font-normal">
                {perk.description}
              </div>
            </div>
          ))}
        </div>

        {/* Dual Cards: Careers & Internships */}
        <div
          ref={positionsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          {/* Open Positions Card */}
          <div
            className={`scroll-reveal-left h-full flex flex-col ${
              positionsVisible ? 'revealed' : ''
            } ${positionsHoverReady ? 'hover-ready' : ''}`}
          >
            <div className="rounded-[16px] bg-[#060317] p-8 sm:p-10 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex flex-col justify-between group h-full flex-1 hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-[#10093a] border border-white/[0.08] flex items-center justify-center text-[#b7a4fb]">
                    <Briefcase className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-aeonik text-xl sm:text-2xl font-medium text-[#f4f0ff]">
                      Open Positions
                    </h3>
                    <p className="text-xs text-[#918ea0] font-normal">
                      Full-time engineering roles in core AI and cloud architecture.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {JOB_POSITIONS.map((pos) => (
                    <div
                      key={pos.id}
                      className="p-3 rounded-[5px] bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs hover:border-[#9382ff]/40 hover:bg-[#10093a]/50 transition-[border-color,background-color] duration-150 ease-out cursor-pointer group/pos"
                    >
                      <div>
                        <div className="font-medium text-[#f4f0ff]">{pos.title}</div>
                        <div className="text-[11px] text-[#918ea0]">{pos.location} • {pos.experience}</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-[5px] text-[10px] font-mono bg-[#10093a] text-[#b7a4fb] border border-white/[0.08]">
                        {pos.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06]">
                <Link to="/careers" className="w-full block">
                  <span className="reflect-primary-btn w-full py-2.5 text-xs justify-center font-medium group/btn">
                    <span>Explore All Positions & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Internships Card */}
          <div
            className={`scroll-reveal-right h-full flex flex-col ${
              positionsVisible ? 'revealed' : ''
            } ${positionsHoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: positionsVisible ? '120ms' : '0ms',
            }}
          >
            <div className="rounded-[16px] bg-[#060317] p-8 sm:p-10 border border-white/[0.06] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex flex-col justify-between group h-full flex-1 hover:border-[#9382ff]/40 transition-[border-color] duration-150 ease-out cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-[#10093a] border border-white/[0.08] flex items-center justify-center text-[#9382ff]">
                    <Rocket className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-aeonik text-xl sm:text-2xl font-medium text-[#f4f0ff]">
                      Available Internships
                    </h3>
                    <p className="text-xs text-[#918ea0] font-normal">
                      Hands-on industry projects for ambitious student developers.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {INTERN_POSITIONS.map((intern) => (
                    <div
                      key={intern.id}
                      className="p-3 rounded-[5px] bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs hover:border-[#9382ff]/40 hover:bg-[#10093a]/50 transition-[border-color,background-color] duration-150 ease-out cursor-pointer group/intern"
                    >
                      <div>
                        <div className="font-medium text-[#f4f0ff]">{intern.title}</div>
                        <div className="text-[11px] text-[#918ea0]">{intern.location} • {intern.duration}</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-[5px] text-[10px] font-mono bg-[#10093a] text-[#9382ff] border border-white/[0.08]">
                        {intern.type}
                      </span>
                    </div>
                  ))}

                  <div className="p-3 rounded-[5px] bg-white/[0.015] border border-dashed border-white/[0.08] flex items-center justify-between text-xs text-[#918ea0]">
                    <div className="space-y-0.5">
                      <div className="font-medium text-[#f4f0ff]">Rolling Admissions</div>
                      <div className="text-[11px] text-[#918ea0]">Reviewed weekly for upcoming cohorts</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-[5px] text-[10px] font-mono bg-[#10093a] text-[#b7a4fb] border border-white/[0.08]">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06]">
                <Link to="/interns" className="w-full block">
                  <span className="reflect-primary-btn w-full py-2.5 text-xs justify-center font-medium group/btn">
                    <span>Apply for Internships</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 8. COMMUNITY TESTIMONIALS (REFLECT CARD SPEC) */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="reflect-ai-badge">
            <Star className="w-3.5 h-3.5 text-[#9382ff]" />
            <span>Community Wall</span>
          </div>
          <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em]">
            Voices from the Ecosystem
          </h2>
          <p className="text-base text-[#918ea0] max-w-xl mx-auto font-normal leading-relaxed">
            Real feedback from graduates, hackathon participants, and partner college directors.
          </p>
        </div>

        {/* Testimonials Marquee */}
        <div className="w-full overflow-hidden">
          <TestimonialsInfiniteMarquee items={TESTIMONIALS} />
        </div>
      </section>

      {/* AURORA GLOW DIVIDER */}
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aurora-divider-line" />
      </div>

      {/* 9. NEWSLETTER SUBSCRIPTION (REFLECT SPEC) */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center space-y-6">
        <div className="space-y-3">
          <div className="reflect-ai-badge">
            <Mail className="w-3.5 h-3.5 text-[#b7a4fb]" />
            <span>Observatory Dispatch</span>
          </div>
          <h2 className="font-aeonik font-medium text-3xl sm:text-4xl text-[#f4f0ff] tracking-[-0.03em]">
            Stay Connected with Tech Insights
          </h2>
          <p className="text-sm sm:text-base text-[#a8a6b7] max-w-lg mx-auto font-normal leading-relaxed">
            Bi-weekly digests covering hackathons, upcoming workshops, AI research, and hiring announcements.
          </p>
        </div>

        <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-2">
          <input
            type="email"
            required
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-2.5 rounded-[5px] bg-[#060317] border border-white/[0.1] text-[#f4f0ff] text-xs placeholder:text-[#918ea0] focus:outline-none focus:border-[#9382ff] transition-all"
          />
          <button
            type="submit"
            disabled={isSubscribing}
            className="reflect-primary-btn py-2.5 px-5 text-xs font-medium shrink-0"
          >
            <span>{isSubscribing ? 'Subscribing...' : 'Subscribe'}</span>
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </form>

        <p className="text-[11px] text-[#918ea0]">
          Zero spam. Unsubscribe at any time with one click.
        </p>
      </section>

      {/* 10. BOTTOM COLLABORATION CTA BANNER */}
      <section id="contact" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-[1248px] mx-auto">
        <div className="rounded-[16px] bg-[#060317] border border-white/[0.08] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] p-10 sm:p-16 relative overflow-hidden text-center space-y-6">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[200px] blur-[100px] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(113, 61, 255, 0.25) 0%, rgba(133, 98, 255, 0.12) 50%, transparent 80%)',
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="reflect-ai-badge">
              <Sparkles className="w-3.5 h-3.5 text-[#b7a4fb]" />
              <span>Shape the Future</span>
            </div>

            <h2 className="font-aeonik font-medium text-3xl sm:text-5xl text-[#f4f0ff] tracking-[-0.03em] leading-tight">
              Ready to construct your future with{' '}
              <span className="cosmic-text-gradient font-medium">Innovex Arena</span>?
            </h2>

            <p className="text-base sm:text-lg text-[#a8a6b7] font-normal leading-relaxed">
              Join thousands of creators shaping technology solutions. Connect with us to participate in hackathons, enroll in cohorts, or partner with our innovation hub.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link to="/contact" className="reflect-primary-btn group">
                <span>Initiate Conversation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/careers" className="reflect-ghost-btn group">
                <span>View Open Roles</span>
                <ChevronRight className="w-4 h-4 text-[#918ea0] group-hover:text-[#f4f0ff] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Event Registration Modal Dialog */}
      <EventRegistrationDialog
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />

      {/* Class Booking Modal Dialog */}
      <ClassBookingDialog
        isOpen={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        defaultMode={bookingDefaultMode}
      />
    </div>
  );
};

export default AboutPage;
