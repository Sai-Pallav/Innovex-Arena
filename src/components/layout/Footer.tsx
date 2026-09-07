import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, Globe, Instagram, Youtube, Linkedin } from 'lucide-react';
import { CONTACT_DETAILS, FOOTER_SECTIONS } from '../../data/siteData';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#080c18]/90 border-t border-white/[0.08] pt-16 pb-12 overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-t from-primary/[0.06] to-transparent blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 mb-14">
          {/* Column 1: Brand & Pitch */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group select-none">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-heading font-black text-base tracking-tight text-white">
                    INNOVEX
                  </span>
                  <span className="font-heading font-bold text-base tracking-tight text-cyan-400">
                    ARENA
                  </span>
                </div>
                <span className="text-[9px] tracking-[0.22em] font-mono text-slate-400 uppercase leading-none mt-1">
                  Fueling the Future of Creators
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
              A tech-driven startup building AI-based products, cloud solutions, and empowering the next generation through workshops, hackathons, and training programs.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.instagram.com/innovex_arena"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white/[0.06] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@innovexarena"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white/[0.06] transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/innovex-arena"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-white/[0.06] transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-200">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {FOOTER_SECTIONS.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-200">
              Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {FOOTER_SECTIONS.services.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-200">
              Resources
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {FOOTER_SECTIONS.resources.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-200">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${CONTACT_DETAILS.email}`} className="hover:text-primary transition-colors">
                  {CONTACT_DETAILS.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${CONTACT_DETAILS.phone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">
                  {CONTACT_DETAILS.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`https://${CONTACT_DETAILS.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {CONTACT_DETAILS.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar (Exact live copy) */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Innovex Arena. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <p className="text-slate-400 font-medium">Fueling the Future of Creators</p>
            <Link to="/admin/login" className="hover:text-primary transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
