import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Globe, Send, Instagram, Youtube, Linkedin, ArrowRight, Calendar, Users } from 'lucide-react';
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
        title: 'Message Sent!',
        description: 'Thank you for reaching out. We will respond within 24 hours.',
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
    <div className="relative pt-28 pb-20 space-y-20">
      {/* Ambient Backdrop Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] ambient-glow-hero pointer-events-none -z-10" />

      {/* 1. HERO (EXACT LIVE SITE COPY) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-3.5 animate-fade-up">
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-white leading-[1.15]">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">Touch</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Have a question or want to work together? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
        </p>
      </section>

      {/* 2. CONTACT CHANNELS & FORM GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-stretch">
          {/* Left Column: Direct Coordinates & Socials */}
          <div className="lg:col-span-5">
            <CyberCard glow="cyan" className="p-6 sm:p-7 h-full flex flex-col">
              <div className="mb-5">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                  Contact Information
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  Feel free to reach out through any of the following channels.
                </p>
              </div>

              <div className="space-y-3 mb-5">
                <a
                  href={`mailto:${CONTACT_DETAILS.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground hover:border-cyan-400/40 hover:text-cyan-300 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Email</span>
                    <span className="text-xs sm:text-sm font-medium truncate block">{CONTACT_DETAILS.email}</span>
                  </div>
                </a>

                <a
                  href={`tel:${CONTACT_DETAILS.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground hover:border-cyan-400/40 hover:text-cyan-300 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Phone</span>
                    <span className="text-xs sm:text-sm font-medium">{CONTACT_DETAILS.phone}</span>
                  </div>
                </a>

                <a
                  href={`https://${CONTACT_DETAILS.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground hover:border-cyan-400/40 hover:text-cyan-300 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Website</span>
                    <span className="text-xs sm:text-sm font-medium truncate block">{CONTACT_DETAILS.website}</span>
                  </div>
                </a>
              </div>

              {/* Follow Us (Exact live social links) */}
              <div className="space-y-3 py-4 border-t border-white/[0.06]">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Follow Us
                </span>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://www.instagram.com/innovex_arena"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white/[0.06] transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com/@innovexarena"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white/[0.06] transition-all"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com/company/innovex-arena"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white/[0.06] transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Our Presence (Exact live copy) */}
              <div className="mt-auto">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 inline-block">
                    {CONTACT_DETAILS.presenceLabel}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
                    {CONTACT_DETAILS.presence}
                  </p>
                </div>
              </div>
            </CyberCard>
          </div>

          {/* Right Column: Send us a Message Form (Exact live labels) */}
          <div className="lg:col-span-7">
            <CyberCard glow="purple" className="p-6 sm:p-7 h-full flex flex-col">
              <div className="mb-5">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                  Send us a Message
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
                <Input
                  label="Full Name *"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Email *"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                  label="Subject *"
                  placeholder="How can we help?"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                <div className="flex-1">
                  <Textarea
                    label="Message *"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="h-full min-h-[120px]"
                  />
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full justify-center mt-auto"
                  type="submit"
                  disabled={isSubmitting}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CyberCard>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTION CARDS (EXACT LIVE SITE BOTTOM CARDS) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link to="/events" className="group">
            <CyberCard glow="cyan" className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                    Register for Events
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Join our upcoming programs
                  </p>
                </div>
                <div className="shrink-0">
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CyberCard>
          </Link>

          <Link to="/careers" className="group">
            <CyberCard glow="purple" className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                    Join Our Team
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore internship opportunities
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
