import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Globe,
  Send,
  Instagram,
  Youtube,
  Linkedin,
  ArrowRight,
  Calendar,
  Users,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { CONTACT_DETAILS } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { ContactFormData } from '../types';
import { useToast } from '../components/ui/Toast';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Message Sent Successfully!',
        description: 'Thank you for reaching out. Our team will get back to you within 24 hours.',
        variant: 'success',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="relative pt-24 sm:pt-28 pb-16 space-y-12 sm:space-y-16">
      {/* Full-Bleed Ambient Cyber Atmosphere (Seamless backdrop without bounding box edges) */}
      <div className="absolute top-0 inset-x-0 h-[680px] overflow-hidden pointer-events-none -z-10">
        {/* Soft diffused cyan auroral glow on the left */}
        <div className="absolute -top-28 -left-20 w-[550px] sm:w-[680px] h-[520px] rounded-full bg-cyan-500/[0.14] blur-[150px]" />
        {/* Soft diffused purple auroral glow on the right */}
        <div className="absolute -top-28 -right-20 w-[550px] sm:w-[680px] h-[520px] rounded-full bg-purple-600/[0.12] blur-[150px]" />
        {/* Center diffused bridge */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[650px] h-[320px] rounded-full bg-sky-500/[0.08] blur-[140px]" />
        {/* Fine cyber grid pattern with smooth radial mask */}
        <div className="absolute inset-0 hero-cyber-grid opacity-30 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_25%,#000_20%,transparent_80%)]" />
      </div>

      {/* 1. HERO HEADER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-3.5 animate-fade-up">
        {/* Clean Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-xs font-semibold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(0,217,255,0.12)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>We&apos;re Here to Help</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.12]">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">Touch</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Have a question or want to work together? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
        </p>
      </section>

      {/* 2. CONTACT CHANNELS & FORM GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Direct Coordinates & Socials */}
          <div className="lg:col-span-5">
            <CyberCard glow="cyan" className="p-6 sm:p-7 h-full flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Contact Information
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Feel free to reach out through any of the following channels.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <a
                    href={`mailto:${CONTACT_DETAILS.email}`}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground hover:border-cyan-400/40 hover:bg-cyan-500/[0.04] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_12px_rgba(0,217,255,0.25)] transition-all shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Email</span>
                        <span className="text-xs sm:text-sm font-medium truncate block text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {CONTACT_DETAILS.email}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </a>

                  <a
                    href={`tel:${CONTACT_DETAILS.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground hover:border-cyan-400/40 hover:bg-cyan-500/[0.04] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_12px_rgba(0,217,255,0.25)] transition-all shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Phone</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {CONTACT_DETAILS.phone}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </a>

                  <a
                    href={`https://${CONTACT_DETAILS.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground hover:border-cyan-400/40 hover:bg-cyan-500/[0.04] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_12px_rgba(0,217,255,0.25)] transition-all shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Website</span>
                        <span className="text-xs sm:text-sm font-medium truncate block text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {CONTACT_DETAILS.website}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </a>
                </div>

                {/* Follow Us */}
                <div className="space-y-3 py-4 border-t border-white/[0.08]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                    Follow Us
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.instagram.com/innovex_arena"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/[0.08] hover:shadow-[0_0_12px_rgba(0,217,255,0.2)] transition-all"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a
                      href="https://youtube.com/@innovexarena"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/[0.08] hover:shadow-[0_0_12px_rgba(0,217,255,0.2)] transition-all"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                    <a
                      href="https://linkedin.com/company/innovex-arena"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/[0.08] hover:shadow-[0_0_12px_rgba(0,217,255,0.2)] transition-all"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Our Presence */}
              <div className="mt-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                    </span>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-300">
                      {CONTACT_DETAILS.presenceLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {CONTACT_DETAILS.presence}
                  </p>
                </div>
              </div>
            </CyberCard>
          </div>

          {/* Right Column: Send us a Message Form */}
          <div className="lg:col-span-7">
            <CyberCard glow="purple" className="p-6 sm:p-7 h-full flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Send us a Message
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Fill out the form and our team will get back to you within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Two-column layout for Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Subject"
                    placeholder="How can we help you?"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />

                  <Textarea
                    label="Message"
                    placeholder="Tell us more about your inquiry or project..."
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[110px]"
                  />

                  <div className="pt-2">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full justify-center shadow-[0_4px_25px_rgba(0,217,255,0.25)] hover:shadow-[0_4px_30px_rgba(0,217,255,0.4)]"
                      type="submit"
                      disabled={isSubmitting}
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      {isSubmitting ? 'Sending Message...' : 'Send Message'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Fast Response Guarantee */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Guaranteed response within 24 hours</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">Encrypted & Secure</span>
              </div>
            </CyberCard>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTION CARDS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link to="/events" className="group block">
            <CyberCard glow="cyan" className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_15px_rgba(0,217,255,0.25)] transition-all shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                    Register for Events
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Join our upcoming workshops, hackathons, and programs
                  </p>
                </div>
                <div className="shrink-0">
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CyberCard>
          </Link>

          <Link to="/careers" className="group block">
            <CyberCard glow="purple" className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400 group-hover:scale-105 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                    Join Our Team
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explore internship, fellowship, and career opportunities
                  </p>
                </div>
                <div className="shrink-0">
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CyberCard>
          </Link>
        </div>
      </section>
    </div>
  );
};

