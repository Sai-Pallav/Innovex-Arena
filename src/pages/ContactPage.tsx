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
  ExternalLink,
} from 'lucide-react';
import { CONTACT_DETAILS } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { ContactFormData } from '../types';
import { useToast } from '../components/ui/Toast';
import { PageAtmosphere } from '../components/layout/PageAtmosphere';

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
    <div className="relative isolate pt-24 sm:pt-28 pb-16 space-y-14 sm:space-y-20">

      {/* ============================================================
          ATMOSPHERIC BACKGROUND — shared PageAtmosphere component
          (8-layer system: base field, primary illumination, secondary
          depth field, peripheral accents, technical grid, 3-depth
          particles, lower decay tail)
          ============================================================ */}
      <PageAtmosphere />

      {/* 1. HERO HEADER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-5 animate-fade-up">
        <h1 className="font-rebond font-medium text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.08]">
          Get in <span className="cosmic-text-gradient">Touch</span>
        </h1>
        <p className="text-base sm:text-lg text-[#c8bfec] max-w-2xl mx-auto leading-relaxed">
          Have a question or want to work together? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
        </p>
      </section>

      {/* 2. CONTACT CHANNELS & FORM GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start">
          {/* Left Column: Direct Coordinates & Socials */}
          <div className="lg:col-span-5">
            <CyberCard glow="cyan" hoverEffect={false} className="p-6 sm:p-8 flex flex-col cursor-default">
              <div className="mb-5">
                <h2 className="font-rebond text-2xl sm:text-3xl font-medium text-white tracking-tight mb-2">
                  Contact Information
                </h2>
                <p className="text-sm text-[#c8bfec] leading-relaxed">
                  Feel free to reach out through any of the following channels.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { href: `mailto:${CONTACT_DETAILS.email}`, icon: <Mail className="w-5 h-5" />, label: 'Email', value: CONTACT_DETAILS.email, truncate: true },
                  { href: `tel:${CONTACT_DETAILS.phone.replace(/\s+/g, '')}`, icon: <Phone className="w-5 h-5" />, label: 'Phone', value: CONTACT_DETAILS.phone, truncate: false },
                  { href: `https://${CONTACT_DETAILS.website}`, icon: <Globe className="w-5 h-5" />, label: 'Website', value: CONTACT_DETAILS.website, truncate: true, external: true },
                ].map(({ href, icon, label, value, truncate, external }) => (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center justify-between gap-3 p-4 rounded-cards bg-white/[0.03] border border-white/[0.08] hover:border-[#9382ff]/40 hover:bg-white/[0.05] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-buttons bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#b7a4fb] group-hover:scale-105 group-hover:border-[#9382ff]/60 group-hover:shadow-[0_0_12px_rgba(147,130,255,0.25)] transition-all shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium uppercase tracking-wide text-[#9b96b0] block mb-0.5">{label}</span>
                        <span className={`text-sm font-medium text-white group-hover:text-[#b7a4fb] transition-colors${truncate ? ' truncate block' : ''}`}>
                          {value}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#9b96b0] group-hover:text-[#b7a4fb] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </a>
                ))}
              </div>

              {/* Follow Us */}
              <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-3">
                <span className="text-sm font-medium uppercase tracking-wide text-white block">
                  Follow Us
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/innovex_arena"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#9b96b0] hover:text-[#b7a4fb] hover:border-[#9382ff]/50 hover:bg-white/[0.08] hover:shadow-[0_0_12px_rgba(147,130,255,0.25)] transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://youtube.com/@innovexarena"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#9b96b0] hover:text-[#b7a4fb] hover:border-[#9382ff]/50 hover:bg-white/[0.08] hover:shadow-[0_0_12px_rgba(147,130,255,0.25)] transition-all"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a
                    href="https://linkedin.com/company/innovex-arena"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#9b96b0] hover:text-[#b7a4fb] hover:border-[#9382ff]/50 hover:bg-white/[0.08] hover:shadow-[0_0_12px_rgba(147,130,255,0.25)] transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </CyberCard>
          </div>

          {/* Right Column: Send us a Message Form */}
          <div className="lg:col-span-7">
            <CyberCard glow="purple" hoverEffect={false} className="p-6 sm:p-8 flex flex-col cursor-default">
              <div className="mb-5">
                <h2 className="font-rebond text-2xl sm:text-3xl font-medium text-white tracking-tight mb-2">
                  Send us a Message
                </h2>
                <p className="text-sm text-[#c8bfec] leading-relaxed">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[140px]"
                />

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full justify-center"
                  type="submit"
                  disabled={isSubmitting}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </Button>
              </form>
            </CyberCard>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTION CARDS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/events" className="group block">
            <CyberCard glow="cyan" className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[5px] bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#b7a4fb] group-hover:scale-105 group-hover:border-[#9382ff]/60 group-hover:shadow-[0_0_15px_rgba(147,130,255,0.25)] transition-all shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-rebond font-medium text-lg text-white group-hover:text-[#b7a4fb] transition-colors mb-1">
                    Register for Events
                  </h3>
                  <p className="text-sm text-[#c8bfec]">
                    Join our upcoming workshops, hackathons, and programs
                  </p>
                </div>
                <div className="shrink-0">
                  <ArrowRight className="w-5 h-5 text-[#9b96b0] group-hover:text-[#b7a4fb] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CyberCard>
          </Link>

          <Link to="/careers" className="group block">
            <CyberCard glow="purple" className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[5px] bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#ba9cff] group-hover:scale-105 group-hover:border-[#9382ff]/60 group-hover:shadow-[0_0_15px_rgba(147,130,255,0.25)] transition-all shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-rebond font-medium text-lg text-white group-hover:text-[#ba9cff] transition-colors mb-1">
                    Join Our Team
                  </h3>
                  <p className="text-sm text-[#c8bfec]">
                    Explore internship, fellowship, and career opportunities
                  </p>
                </div>
                <div className="shrink-0">
                  <ArrowRight className="w-5 h-5 text-[#9b96b0] group-hover:text-[#ba9cff] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CyberCard>
          </Link>
        </div>
      </section>
    </div>
  );
};

