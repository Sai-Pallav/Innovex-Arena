import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
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
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { EventRegistrationDialog } from '../components/modules/EventRegistrationDialog';
import { ClassBookingDialog } from '../components/modules/ClassBookingDialog';
import { TestimonialsInfiniteMarquee } from '../components/modules/TestimonialsInfiniteMarquee';
import { HeroFeatureRotator } from '../components/modules/HeroFeatureRotator';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { EventItem, LearningModeType } from '../types';
import { useToast } from '../components/ui/Toast';

export const HomePage: React.FC = () => {
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

  const [visionMissionHoverReady, setVisionMissionHoverReady] = useState(false);
  const [aboutCardsHoverReady, setAboutCardsHoverReady] = useState(false);

  useEffect(() => {
    if (visionMissionVisible) {
      const timer = setTimeout(() => {
        setVisionMissionHoverReady(true);
      }, 1150);
      return () => clearTimeout(timer);
    }
  }, [visionMissionVisible]);

  useEffect(() => {
    if (aboutCardsVisible) {
      const timer = setTimeout(() => {
        setAboutCardsHoverReady(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [aboutCardsVisible]);

  // 3. Our Services section reveal
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [servicesHoverReady, setServicesHoverReady] = useState(false);

  useEffect(() => {
    if (servicesVisible) {
      const timer = setTimeout(() => setServicesHoverReady(true), 1750);
      return () => clearTimeout(timer);
    }
  }, [servicesVisible]);

  // 4. Products section reveal
  const { ref: productsRef, isVisible: productsVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [productsHoverReady, setProductsHoverReady] = useState(false);

  useEffect(() => {
    if (productsVisible) {
      const timer = setTimeout(() => setProductsHoverReady(true), 1750);
      return () => clearTimeout(timer);
    }
  }, [productsVisible]);

  // 5. Classes section reveal
  const { ref: classesRef, isVisible: classesVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [classesHoverReady, setClassesHoverReady] = useState(false);

  useEffect(() => {
    if (classesVisible) {
      const timer = setTimeout(() => setClassesHoverReady(true), 1750);
      return () => clearTimeout(timer);
    }
  }, [classesVisible]);

  // 6. Events section reveal
  const { ref: eventsRef, isVisible: eventsVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [eventsHoverReady, setEventsHoverReady] = useState(false);

  useEffect(() => {
    if (eventsVisible) {
      const timer = setTimeout(() => setEventsHoverReady(true), 1750);
      return () => clearTimeout(timer);
    }
  }, [eventsVisible]);

  // 7. Career Perks (uploaded part: appear one by one)
  const { ref: perksRef, isVisible: perksVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [perksHoverReady, setPerksHoverReady] = useState(false);

  useEffect(() => {
    if (perksVisible) {
      const timer = setTimeout(() => setPerksHoverReady(true), 2300);
      return () => clearTimeout(timer);
    }
  }, [perksVisible]);

  // 8. Open Positions (from left) & Available Internships (from right)
  const { ref: positionsRef, isVisible: positionsVisible } = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [positionsHoverReady, setPositionsHoverReady] = useState(false);

  useEffect(() => {
    if (positionsVisible) {
      const timer = setTimeout(() => setPositionsHoverReady(true), 1650);
      return () => clearTimeout(timer);
    }
  }, [positionsVisible]);

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
        title: 'Successfully Subscribed!',
        description: 'Thank you for joining our newsletter. Stay tuned for updates!',
        variant: 'success',
      });
      setNewsletterEmail('');
    }, 600);
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout':
        return <Layout className="w-5 h-5 text-primary" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-primary" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-primary" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-primary" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-primary" />;
      case 'Users':
        return <Users className="w-5 h-5 text-primary" />;
      default:
        return <Code className="w-5 h-5 text-primary" />;
    }
  };

  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-cyan-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'Code':
        return <Code className="w-5 h-5 text-cyan-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-purple-400" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-cyan-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="relative pb-20 overflow-hidden">
      {/* Hero Full-Screen Viewport Container - Centered on the Screen */}
      <div className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden">
        {/* Hero Ambient Cyber Background - exact match to design reference */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* High-definition Cyber Grid with gentle edge falloff */}
          <div className="absolute inset-0 hero-cyber-grid opacity-85" />

          {/* Left Radiant Cyan Ambient Glow - vertically centered on screen */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -left-[20%] sm:-left-[10%] lg:-left-[5%] w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] rounded-full blur-[100px] sm:blur-[135px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.25) 0%, rgba(6, 182, 212, 0.13) 42%, transparent 70%)'
            }}
          />

          {/* Right Radiant Purple/Violet Ambient Glow - vertically centered on screen */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -right-[20%] sm:-right-[10%] lg:-right-[5%] w-[520px] sm:w-[720px] h-[520px] sm:h-[720px] rounded-full blur-[110px] sm:blur-[145px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.13) 42%, transparent 70%)'
            }}
          />

          {/* Center Contrast Vignette for crystal-clear typography legibility */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 75% 60% at 50% 50%, rgba(5, 8, 20, 0.65) 0%, transparent 85%)'
            }}
          />

          {/* Smooth Bottom Gradient Fade into page flow */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
        </div>

        {/* 1. HERO SECTION (CENTERED IN THE SCREEN) */}
        <section id="hero" className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-4 sm:space-y-5 pt-20 sm:pt-24 pb-8 sm:pb-12 my-auto flex flex-col justify-center items-center">
          <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-3.5 animate-fade-up">
            {/* Top Micro-Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/[0.08] border border-cyan-400/25 backdrop-blur-md shadow-[0_0_20px_rgba(0,217,255,0.12)] group hover:border-cyan-400/40 hover:bg-cyan-500/[0.12] transition-all duration-300 cursor-default mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-[13px] font-medium tracking-wide text-cyan-200">
                {HERO_DATA.badge}
              </span>
            </div>

            {/* Unified Headline + Tagline Lockup */}
            <div className="space-y-1 sm:space-y-1.5">
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-[3.8rem] tracking-tight text-white leading-[1.12] max-w-4xl mx-auto">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 drop-shadow-[0_0_35px_rgba(0,217,255,0.35)]">
                  Innovex Arena
                </span>
              </h1>
              <p className="font-heading text-sm sm:text-lg lg:text-xl text-cyan-400/90 font-medium tracking-wide">
                {HERO_DATA.tagline}
              </p>
            </div>

            {/* Unified Narrative & Capabilities Lockup */}
            <div className="space-y-2.5 max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                {HERO_DATA.subtitle}
              </p>

              {/* Harmonious Centered Typewriter Specialization Capsule */}
              <HeroFeatureRotator />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 animate-fade-up animation-delay-200">
            <Link to="/services">
              <Button variant="hero" size="md" rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}>
                Explore Services
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="md">
                View Events
              </Button>
            </Link>
            <Link to="/classes">
              <Button variant="outline" size="md">
                Explore Classes
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-3 sm:pt-4 w-full animate-fade-up animation-delay-300">
            {HERO_DATA.stats.map((stat, i) => (
              <div
                key={i}
                className="relative overflow-hidden py-3 px-3.5 sm:py-4 sm:px-5 rounded-2xl bg-gradient-to-b from-slate-900/60 to-[#070b18]/80 border border-white/[0.08] hover:border-cyan-400/40 backdrop-blur-xl text-center space-y-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8),0_0_24px_rgba(0,217,255,0.16)] group"
              >
                <div className="shimmer-hairline opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:scale-105 transition-all duration-300 inline-block">
                  <AnimatedCounter value={stat.value} duration={2000} delay={i * 80} />
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono uppercase tracking-wider group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Main Content Sections Flow */}
      <div className="relative z-10 space-y-20 sm:space-y-28 pt-8 sm:pt-14">
        {/* 2. ABOUT INNOVEX ARENA / VISION & MISSION */}
        <section id="about" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 overflow-hidden scroll-mt-28">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
            About <span className="text-gradient-cyan">Innovex Arena</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Pioneering technology innovation and empowering the next generation of engineers.
          </p>
        </div>

        <div
          ref={visionMissionRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          {/* Vision - appears from left side */}
          <div
            className={`scroll-reveal-left h-full flex flex-col ${
              visionMissionVisible ? 'revealed' : ''
            } ${visionMissionHoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: visionMissionVisible ? '0ms' : '0ms',
            }}
          >
            <CyberCard
              glow="cyan"
              hoverEffect={visionMissionHoverReady}
              className="p-6 sm:p-7 h-full flex-1"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_16px_rgba(0,217,255,0.25)] transition-all duration-300">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-semibold text-white group-hover:text-cyan-200 transition-colors duration-200">
                    {VISION_MISSION.vision.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {VISION_MISSION.vision.description}
                </p>
              </div>
            </CyberCard>
          </div>

          {/* Mission - appears from right side */}
          <div
            className={`scroll-reveal-right h-full flex flex-col ${
              visionMissionVisible ? 'revealed' : ''
            } ${visionMissionHoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: visionMissionVisible ? '120ms' : '0ms',
            }}
          >
            <CyberCard
              glow="purple"
              hoverEffect={visionMissionHoverReady}
              className="p-6 sm:p-7 h-full flex-1"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 group-hover:border-purple-400/40 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.25)] transition-all duration-300">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-semibold text-white group-hover:text-purple-200 transition-colors duration-200">
                    {VISION_MISSION.mission.title}
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {VISION_MISSION.mission.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400 leading-normal group/item">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:text-cyan-300 transition-colors" />
                      <span className="group-hover:text-slate-300 transition-colors">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CyberCard>
          </div>
        </div>

        {/* 6 What We Do Cards */}
        <div
          ref={aboutCardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch pt-4"
        >
          {CORE_SERVICES_HOME.map((srv, idx) => (
            <div
              key={idx}
              className={`scroll-reveal-card h-full flex flex-col ${
                aboutCardsVisible ? 'revealed' : ''
              } ${aboutCardsHoverReady ? 'hover-ready' : ''}`}
              style={{
                transitionDelay: aboutCardsVisible ? `${idx * 90}ms` : '0ms',
              }}
            >
              <CyberCard
                glow="cyan"
                hoverEffect={aboutCardsHoverReady}
                className="p-5 sm:p-6 group flex flex-col justify-between h-full"
              >
                <div className="flex-1 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/[0.08] border border-cyan-400/20 flex items-center justify-center text-cyan-400 mb-3.5 group-hover:scale-110 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/15 group-hover:shadow-[0_0_16px_rgba(0,217,255,0.2)] transition-all duration-300">
                    {getServiceIcon(srv.iconName)}
                  </div>
                  <h3 className="font-heading text-sm sm:text-base font-semibold text-white group-hover:text-cyan-200 transition-colors duration-200 mb-1.5 leading-snug min-h-[1.5rem] sm:min-h-[1.75rem]">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[2.5rem]">
                    {srv.description}
                  </p>
                </div>
                <div className="mt-auto pt-3.5 border-t border-white/[0.06]">
                  <Link to="/services" className="inline-flex">
                    <span className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200">
                      Learn More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </Link>
                </div>
              </CyberCard>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SERVICES OVERVIEW (EXACT LIVE SITE COPY - REFINED CLEAN & PROFESSIONAL) */}
      <section id="services" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
              Our <span className="text-gradient-cyan">Services</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Empowering the next generation with cutting-edge technology education and real-world experience.
            </p>
          </div>
          <Link to="/services">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Services
            </Button>
          </Link>
        </div>

        {/* Featured Service Event Highlights from live site */}
        <div ref={servicesRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div className={`scroll-reveal-card h-full flex flex-col ${servicesVisible ? 'revealed' : ''} ${servicesHoverReady ? 'hover-ready' : ''}`}>
            <CyberCard glow="cyan" hoverEffect={servicesHoverReady} className="p-5 sm:p-6 flex flex-col justify-between group h-full">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors duration-200 mb-2 min-h-[1.75rem] sm:min-h-[2rem]">
                    AI & ML Workshop
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[2.5rem] sm:min-h-[2.75rem]">
                    Hands-on learning in Artificial Intelligence, Machine Learning, and Generative AI technologies.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-cyan-400/25 group-hover:bg-white/[0.04] transition-all duration-300 space-y-1.5 text-xs text-slate-300 min-h-[4.25rem] flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>January 15, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Virtual Event (100+ Expected)</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-3.5 border-t border-white/[0.06]">
                <Link to="/services#workshops" className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200">
                  Explore Workshops <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </CyberCard>
          </div>

          <div className={`scroll-reveal-card h-full flex flex-col ${servicesVisible ? 'revealed' : ''} ${servicesHoverReady ? 'hover-ready' : ''}`}>
            <CyberCard glow="purple" hoverEffect={servicesHoverReady} className="p-5 sm:p-6 flex flex-col justify-between group h-full">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-200 mb-2 min-h-[1.75rem] sm:min-h-[2rem]">
                    Cloud Computing Bootcamp
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[2.5rem] sm:min-h-[2.75rem]">
                    Master cloud platforms and build scalable solutions with AWS, Azure, and GCP.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-purple-400/25 group-hover:bg-white/[0.04] transition-all duration-300 space-y-1.5 text-xs text-slate-300 min-h-[4.25rem] flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>January 22-23, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>Hyderabad Campus (50 Seats)</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-3.5 border-t border-white/[0.06]">
                <Link to="/services#training" className="text-xs font-medium text-purple-400 group-hover:text-purple-300 flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200">
                  Explore Bootcamps <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </CyberCard>
          </div>

          <div className={`scroll-reveal-card h-full flex flex-col ${servicesVisible ? 'revealed' : ''} ${servicesHoverReady ? 'hover-ready' : ''}`}>
            <CyberCard glow="cyan" hoverEffect={servicesHoverReady} className="p-5 sm:p-6 flex flex-col justify-between group h-full">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors duration-200 mb-2 min-h-[1.75rem] sm:min-h-[2rem]">
                    Innovation Hackathon 2025
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[2.5rem] sm:min-h-[2.75rem]">
                    College hackathons, innovation challenges, and idea pitch competitions.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-cyan-400/25 group-hover:bg-white/[0.04] transition-all duration-300 space-y-1.5 text-xs text-slate-300 min-h-[4.25rem] flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>February 10-11, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Multiple Colleges (500+ Participants)</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-3.5 border-t border-white/[0.06]">
                <Link to="/services#hackathons" className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200">
                  Explore Hackathons <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </CyberCard>
          </div>
        </div>
      </section>

      {/* 4. PRODUCTS OVERVIEW (EXACT LIVE SITE COPY - REFINED CLEAN & PROFESSIONAL) */}
      <section id="products" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
              Our <span className="text-gradient-cyan">Products</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Explore the innovative solutions we&apos;ve built using AI, cloud computing, and emerging technologies.
            </p>
          </div>
          <Link to="/products">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore All Products
            </Button>
          </Link>
        </div>

        <div ref={productsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className={`scroll-reveal-card h-full flex flex-col ${productsVisible ? 'revealed' : ''} ${productsHoverReady ? 'hover-ready' : ''}`}
            >
              <CyberCard glow="purple" hoverEffect={productsHoverReady} className="p-5 sm:p-6 flex flex-col justify-between group h-full">
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-200 mb-1.5 min-h-[1.75rem]">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-normal leading-snug min-h-[1.25rem]">
                      {prod.tagline}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed min-h-[3.25rem]">
                      {prod.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1 min-h-[3.25rem] content-start">
                    {prod.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-purple-300 hover:border-purple-400/40 hover:bg-purple-500/10 transition-colors duration-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                  <Link to="/products" className="text-xs font-medium text-purple-400 group-hover:text-purple-300 flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200">
                    View Product Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </CyberCard>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CLASSES OVERVIEW (ONLINE & OFFLINE CLASSES PREVIEW - REFINED CLEAN & PROFESSIONAL) */}
      <section id="classes" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
              Online & Offline <span className="text-gradient-cyan">Classes</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Learn virtually from anywhere with a 24/7 AI tutor, or immerse yourself in our high-spec campus labs with desk-side instructors.
            </p>
          </div>
          <Link to="/classes">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Full Comparison & Hubs
            </Button>
          </Link>
        </div>

        {/* 3 Mode Cards */}
        <div ref={classesRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {LEARNING_MODES.map((mode) => (
            <div
              key={mode.id}
              className={`scroll-reveal-card h-full flex flex-col ${classesVisible ? 'revealed' : ''} ${classesHoverReady ? 'hover-ready' : ''}`}
            >
              <CyberCard
                glow={mode.id === 'offline' ? 'purple' : 'cyan'}
                hoverEffect={classesHoverReady}
                className="p-5 sm:p-6 flex flex-col justify-between group h-full"
              >
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3.5 group-hover:scale-110 transition-all duration-300 ${
                        mode.id === 'online'
                          ? 'bg-cyan-500/[0.08] border-cyan-400/20 text-cyan-400 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_16px_rgba(0,217,255,0.25)]'
                          : mode.id === 'offline'
                          ? 'bg-purple-500/10 border-purple-400/20 text-purple-400 group-hover:border-purple-400/40 group-hover:shadow-[0_0_16px_rgba(168,85,247,0.25)]'
                          : 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400 group-hover:border-emerald-400/40 group-hover:shadow-[0_0_16px_rgba(52,211,153,0.25)]'
                      }`}
                    >
                      {mode.id === 'online' && <Video className="w-4.5 h-4.5" />}
                      {mode.id === 'offline' && <Building2 className="w-4.5 h-4.5" />}
                      {mode.id === 'hybrid' && <Layers className="w-4.5 h-4.5" />}
                    </div>

                    <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors duration-200 mb-1 min-h-[1.75rem]">
                      {mode.title}
                    </h3>
                    <p className="text-xs text-cyan-300/80 font-normal min-h-[1.25rem] sm:min-h-[2.25rem]">
                      {mode.tagline}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed min-h-[3.25rem]">
                      {mode.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-white/[0.12] group-hover:bg-white/[0.04] transition-all duration-300 space-y-1.5 text-xs text-slate-300 min-h-[4.25rem] flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{mode.cohortSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{mode.schedule}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3.5 border-t border-white/[0.06] flex items-center gap-2">
                  <Button
                    variant={mode.id === 'offline' ? 'secondary' : 'hero'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openBookingModal(mode.id)}
                  >
                    {mode.id === 'offline' ? 'Tour Lab' : 'Free Demo'}
                  </Button>
                  <Link to="/classes">
                    <Button variant="ghost" size="sm" className="text-xs px-2.5 text-slate-400 hover:text-white">
                      Details
                    </Button>
                  </Link>
                </div>
              </CyberCard>
            </div>
          ))}
        </div>
      </section>

      {/* 6. EVENTS OVERVIEW (EXACT LIVE SITE COPY - REFINED CLEAN & PROFESSIONAL) */}
      <section id="events" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
              Upcoming <span className="text-gradient-cyan">Events</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Join us for transformative workshops, hackathons, and training programs.
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Events
            </Button>
          </Link>
        </div>

        <div ref={eventsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {EVENTS_DATA.slice(0, 3).map((evt) => (
            <div
              key={evt.id}
              className={`scroll-reveal-card h-full flex flex-col ${eventsVisible ? 'revealed' : ''} ${eventsHoverReady ? 'hover-ready' : ''}`}
            >
              <CyberCard glow="cyan" hoverEffect={eventsHoverReady} className="p-5 sm:p-6 flex flex-col justify-between group h-full">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors duration-200 line-clamp-2 mb-2 min-h-[2.75rem] sm:min-h-[3rem]">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3.5 min-h-[3.25rem]">
                      {evt.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-cyan-400/25 group-hover:bg-white/[0.04] transition-all duration-300 space-y-2 text-xs text-slate-400 mb-4 min-h-[6.25rem] flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-200">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3.5 border-t border-white/[0.06]">
                  <Button
                    variant="hero"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedEvent(evt)}
                  >
                    Register Now
                  </Button>
                </div>
              </CyberCard>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CAREERS OVERVIEW (WHY JOIN US + ROLES PREVIEW - REFINED CLEAN & PROFESSIONAL) */}
      <section id="careers-internships" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 scroll-mt-28">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
            Join <span className="text-gradient-cyan">Innovex Arena</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
            Start your career journey with us. We&apos;re looking for passionate individuals who want to make an impact in the tech world.
          </p>
        </div>

        {/* Perks Grid (Exact 6 perks from live site - appear one by one) */}
        <div
          ref={perksRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5"
        >
          {CAREER_PERKS.map((perk, i) => (
            <div
              key={i}
              className={`scroll-reveal-card p-3.5 rounded-2xl bg-[#0a0f1e]/60 border border-white/[0.05] text-center space-y-2 hover:border-cyan-400/35 hover:-translate-y-1 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.7),0_0_20px_rgba(0,217,255,0.12)] hover:bg-[#0d1426] transition-all duration-300 ease-out flex flex-col justify-between group/perk ${
                perksVisible ? 'revealed' : ''
              } ${perksHoverReady ? 'hover-ready' : ''}`}
              style={{
                transitionDelay: perksVisible ? `${i * 120}ms` : '0ms',
              }}
            >
              <div className="w-8 h-8 mx-auto rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover/perk:scale-110 group-hover/perk:border-cyan-400/30 group-hover/perk:bg-cyan-500/10 transition-all duration-300">
                {getPerkIcon(perk.iconName)}
              </div>
              <div className="font-heading font-medium text-xs text-white group-hover/perk:text-cyan-200 transition-colors min-h-[1.25rem] flex items-center justify-center">
                {perk.title}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight font-normal min-h-[2rem] flex items-center justify-center">
                {perk.description}
              </div>
            </div>
          ))}
        </div>

        {/* Dual Cards: Careers (Left) & Internships (Right) */}
        <div
          ref={positionsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        >
          {/* Careers / Open Positions Card - appears from left side */}
          <div
            className={`scroll-reveal-left h-full flex flex-col ${
              positionsVisible ? 'revealed' : ''
            } ${positionsHoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: positionsVisible ? '0ms' : '0ms',
            }}
          >
            <CyberCard glow="cyan" hoverEffect={positionsHoverReady} className="p-6 sm:p-7 flex flex-col justify-between group h-full flex-1">
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_18px_rgba(0,217,255,0.25)] transition-all duration-300">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>

                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-white group-hover:text-cyan-200 transition-colors duration-200 mb-1.5">
                      Open Positions
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed min-h-[2.5rem]">
                      Explore our current openings managed by admin and build next-generation scalable systems.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 flex-1 flex flex-col justify-center">
                  {JOB_POSITIONS.map((pos) => (
                    <div key={pos.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs hover:border-cyan-400/30 hover:bg-white/[0.04] hover:translate-x-1 transition-all duration-200 cursor-pointer group/pos">
                      <div>
                        <div className="font-medium text-white group-hover/pos:text-cyan-200 transition-colors">{pos.title}</div>
                        <div className="text-[11px] text-slate-400">{pos.location} • {pos.experience}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 group-hover/pos:border-cyan-400/40 transition-colors">
                        {pos.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-5 border-t border-white/[0.06]">
                <Link to="/careers" className="w-full block">
                  <Button variant="hero" size="sm" className="w-full justify-center group/btn" rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />}>
                    Explore All Positions & Apply
                  </Button>
                </Link>
              </div>
            </CyberCard>
          </div>

          {/* Internships / Available Internships Card - appears from right side */}
          <div
            className={`scroll-reveal-right h-full flex flex-col ${
              positionsVisible ? 'revealed' : ''
            } ${positionsHoverReady ? 'hover-ready' : ''}`}
            style={{
              transitionDelay: positionsVisible ? '120ms' : '0ms',
            }}
          >
            <CyberCard glow="purple" hoverEffect={positionsHoverReady} className="p-6 sm:p-7 flex flex-col justify-between group h-full flex-1">
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:border-purple-400/40 group-hover:shadow-[0_0_18px_rgba(168,85,247,0.25)] transition-all duration-300">
                    <Rocket className="w-4.5 h-4.5" />
                  </div>

                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-white group-hover:text-purple-200 transition-colors duration-200 mb-1.5">
                      Available Internships
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed min-h-[2.5rem]">
                      Kickstart your tech career with hands-on experience and mentorship from industry experts.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 flex-1 flex flex-col justify-center">
                  {INTERN_POSITIONS.map((intern) => (
                    <div key={intern.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs hover:border-purple-400/30 hover:bg-white/[0.04] hover:translate-x-1 transition-all duration-200 cursor-pointer group/intern">
                      <div>
                        <div className="font-medium text-white group-hover/intern:text-purple-200 transition-colors">{intern.title}</div>
                        <div className="text-[11px] text-slate-400">{intern.location} • {intern.duration}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-400/20 group-hover/intern:border-purple-400/40 transition-colors">
                        {intern.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-5 border-t border-white/[0.06]">
                <Link to="/interns" className="w-full block">
                  <Button variant="secondary" size="sm" className="w-full justify-center group/btn" rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />}>
                    Apply for Internships
                  </Button>
                </Link>
              </div>
            </CyberCard>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS & COMMUNITY VOICES (INFINITE MOVING MARQUEE WITH LEFT/RIGHT CONTROLS) */}
      <section className="w-full overflow-hidden">
        <TestimonialsInfiniteMarquee items={TESTIMONIALS} />
      </section>

      {/* 9. NEWSLETTER SUBSCRIPTION (EXACT LIVE SITE SECTION - REFINED CLEAN & PROFESSIONAL) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-10 border border-white/[0.07] bg-[#0b101e]/80 backdrop-blur-xl text-center space-y-3 sm:space-y-4 hover:border-white/[0.14] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(0,217,255,0.06)] transition-all duration-300 group overflow-hidden">
          <div className="shimmer-hairline opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none rounded-3xl" />
          <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-white tracking-[-0.015em]">
            Subscribe to Our <span className="text-gradient-cyan">Newsletter</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Get the latest updates on events, workshops, tech articles, and exclusive opportunities delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2 relative z-10">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white/[0.05] transition-all"
            />
            <Button variant="hero" size="sm" type="submit" disabled={isSubscribing} rightIcon={<Send className="w-3.5 h-3.5" />}>
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          <p className="text-[11px] text-slate-500 relative z-10">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* 10. BOTTOM CTA BANNER (EXACT LIVE SECTION - REFINED CLEAN & PROFESSIONAL) */}
      <section id="contact" className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-28">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-white/[0.07] bg-[#0b101e]/75 backdrop-blur-xl shadow-2xl text-center space-y-4 transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(0,217,255,0.08)] group">
          <div className="shimmer-hairline opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.04] via-transparent to-purple-500/[0.04] pointer-events-none" />
          <h2 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
            Ready to <span className="text-gradient-cyan">Transform</span> Your Future?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Join Innovex Arena and become part of a community that&apos;s shaping the next generation of tech leaders. Whether you&apos;re looking to learn, build, or innovate — we&apos;ve got you covered.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/careers">
              <Button variant="hero" size="md">
                Join Our Team
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="md">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>

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
