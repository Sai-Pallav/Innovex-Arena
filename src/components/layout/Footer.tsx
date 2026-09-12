import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, Globe, Instagram, Youtube, Linkedin } from 'lucide-react';
import { CONTACT_DETAILS, FOOTER_SECTIONS } from '../../data/siteData';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#030014] pt-16 pb-12 overflow-hidden">
      {/* 1px Aurora Divider Line with glowing violet midpoint */}
      <div className="aurora-divider-line absolute top-0 left-0 right-0" />

      {/* Background ultraviolet bloom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-gradient-to-t from-[#713dff]/[0.07] to-transparent blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 mb-14">
          {/* Column 1: Brand & Pitch */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group select-none">
              <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#b7a4fb] group-hover:border-[#9382ff]/60 group-hover:shadow-[0_0_15px_rgba(147,130,255,0.3)] transition-all">
                <Sparkles className="w-4.5 h-4.5 text-[#b7a4fb]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-rebond font-black text-base tracking-tight text-white">
                    INNOVEX
                  </span>
                  <span className="font-rebond font-medium text-base tracking-tight cosmic-text-gradient">
                    ARENA
                  </span>
                </div>
                <span className="text-[9px] tracking-[0.22em] font-mono text-[#9b96b0] uppercase leading-none mt-1">
                  Fueling the Future of Creators
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#9b96b0] leading-relaxed max-w-sm font-normal">
              A tech-driven startup building AI-based products, cloud solutions, and empowering the next generation through workshops, hackathons, and training programs.
            </p>
            {/* Social Icons - 999px pills */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.instagram.com/innovex_arena"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#9b96b0] hover:text-[#b7a4fb] hover:border-[#9382ff]/50 hover:bg-white/[0.08] hover:shadow-[0_0_12px_rgba(147,130,255,0.25)] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@innovexarena"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#9b96b0] hover:text-[#b7a4fb] hover:border-[#9382ff]/50 hover:bg-white/[0.08] hover:shadow-[0_0_12px_rgba(147,130,255,0.25)] transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/innovex-arena"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#9b96b0] hover:text-[#b7a4fb] hover:border-[#9382ff]/50 hover:bg-white/[0.08] hover:shadow-[0_0_12px_rgba(147,130,255,0.25)] transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="font-rebond font-medium text-xs uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#9b96b0]">
              {FOOTER_SECTIONS.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-[#b7a4fb] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="space-y-3">
            <h4 className="font-rebond font-medium text-xs uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#9b96b0]">
              {FOOTER_SECTIONS.services.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-[#b7a4fb] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-3">
            <h4 className="font-rebond font-medium text-xs uppercase tracking-wider text-white">
              Resources
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#9b96b0]">
              {FOOTER_SECTIONS.resources.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-[#b7a4fb] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="space-y-3">
            <h4 className="font-rebond font-medium text-xs uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#9b96b0]">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#b7a4fb] shrink-0" />
                <a href={`mailto:${CONTACT_DETAILS.email}`} className="hover:text-[#b7a4fb] transition-colors">
                  {CONTACT_DETAILS.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#b7a4fb] shrink-0" />
                <a href={`tel:${CONTACT_DETAILS.phone.replace(/\s+/g, '')}`} className="hover:text-[#b7a4fb] transition-colors">
                  {CONTACT_DETAILS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#b7a4fb] shrink-0" />
                <a
                  href={`https://${CONTACT_DETAILS.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#b7a4fb] transition-colors"
                >
                  {CONTACT_DETAILS.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9b96b0]/70">
          <p>© {new Date().getFullYear()} Innovex Arena. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <p className="text-[#9b96b0] font-medium">Fueling the Future of Creators</p>
            <Link to="/admin/login" className="hover:text-[#b7a4fb] transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
