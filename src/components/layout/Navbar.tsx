import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  X,
  Shield,
  ArrowRight,
  Video,
  Building2,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { NAVIGATION_LINKS } from '../../data/siteData';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('/');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(location.pathname);
      return;
    }

    const handleScrollActive = () => {
      if (location.pathname !== '/') return;
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const rect = aboutEl.getBoundingClientRect();
        if (rect.top <= 250 && rect.bottom >= 150) {
          setActiveSection('/#about');
          return;
        }
      }
      if (window.scrollY < 300) {
        setActiveSection('/');
      } else if (location.hash === '#about') {
        setActiveSection('/#about');
      }
    };

    handleScrollActive();
    window.addEventListener('scroll', handleScrollActive, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollActive);
  }, [location.pathname, location.hash]);

  const isLinkActive = (href: string) => {
    if (location.pathname === '/') {
      if (href === '/#about') return activeSection === '/#about';
      if (href === '/') return activeSection === '/';
      return false;
    }
    return location.pathname === href;
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isMobile: boolean = false
  ) => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
    if (href === '/#about') {
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById('about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', '/#about');
          setActiveSection('/#about');
        }
      }
    } else if (href === '/') {
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        setActiveSection('/');
      }
    }
  };

  return (
    <>
      {/* Premium Glassmorphic Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled ? 'py-3' : 'py-4 md:py-6'
        }`}
      >
        {/* Backdrop Blur Layer */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isScrolled
              ? 'bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/80 backdrop-blur-xl'
              : 'bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-transparent backdrop-blur-md'
          }`}
        />

        {/* Top Border Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent transition-opacity duration-500 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link
              to="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="flex items-center gap-3 group relative z-10 shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/90 to-blue-600/90 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                  Innovex Arena
                </span>
                <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase leading-none mt-0.5">
                  Fueling Creators
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center">
              {NAVIGATION_LINKS.map((link) => {
                const isActive = isLinkActive(link.href);
                const hasDropdown = link.name === 'Classes';

                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => hasDropdown && setActiveDropdown(link.name)}
                    onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
                  >
                    <Link
                      to={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`
                        group/link relative px-2.5 xl:px-3.5 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200 flex items-center gap-1.5
                        ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-300 hover:text-white'
                        }
                      `}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20" />
                      )}
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-lg bg-white/0 group-hover/link:bg-white/5 transition-colors duration-200" />
                      
                      <span className="relative z-10">{link.name}</span>
                      
                      {hasDropdown && (
                        <ChevronDown 
                          className={`relative z-10 w-3.5 h-3.5 transition-transform duration-200 ${
                            activeDropdown === link.name ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* Dropdown Menu */}
                    {hasDropdown && (
                      <div
                        className={`
                          absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[340px]
                          transition-all duration-200 origin-top
                          ${
                            activeDropdown === link.name
                              ? 'opacity-100 scale-100 pointer-events-auto'
                              : 'opacity-0 scale-95 pointer-events-none'
                          }
                        `}
                      >
                        <div className="rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                          <div className="p-2 space-y-1">
                            <Link
                              to="/classes#classes"
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group/item"
                            >
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                                <Video className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white group-hover/item:text-cyan-300 transition-colors">
                                  Live Online Classes
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                  Interactive sessions with expert instructors
                                </p>
                              </div>
                            </Link>

                            <Link
                              to="/classes#classes"
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group/item"
                            >
                              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white group-hover/item:text-purple-300 transition-colors">
                                  Campus Programs
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                  Hands-on learning in premium facilities
                                </p>
                              </div>
                            </Link>

                            <Link
                              to="/classes#classes"
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group/item"
                            >
                              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                <Layers className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white group-hover/item:text-emerald-300 transition-colors">
                                  Hybrid Learning
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                  Flexible blend of online and offline
                                </p>
                              </div>
                            </Link>
                          </div>

                          <div className="border-t border-white/5 p-3">
                            <Link
                              to="/classes"
                              className="flex items-center justify-between text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/more"
                            >
                              <span>View All Programs</span>
                              <ArrowRight className="w-4 h-4 group-hover/more:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link
                to="/admin/login"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all duration-200 group"
                title="Admin Portal"
              >
                <Shield className="w-4.5 h-4.5" />
              </Link>

              <Link to="/contact">
                <button className="relative px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`
          fixed inset-0 z-40 lg:hidden transition-all duration-300
          ${isMobileOpen ? 'visible' : 'invisible'}
        `}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`
            absolute top-20 left-4 right-4 max-h-[calc(100vh-6rem)] overflow-y-auto
            rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10
            shadow-2xl shadow-black/50 transition-all duration-300
            ${
              isMobileOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-4'
            }
          `}
        >
          <div className="p-4 space-y-1">
            {NAVIGATION_LINKS.map((link) => {
              const isActive = isLinkActive(link.href);
              const hasDropdown = link.name === 'Classes';

              return (
                <div key={link.href}>
                  <Link
                    to={link.href}
                    onClick={(e) => {
                      if (!hasDropdown) {
                        handleNavClick(e, link.href, true);
                      }
                    }}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-cyan-500/10 text-white border border-cyan-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </Link>

                  {hasDropdown && (
                    <div className="mt-2 ml-4 space-y-1 pb-2 border-l-2 border-white/5 pl-4">
                      <Link
                        to="/classes#classes"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Live Online</span>
                      </Link>
                      <Link
                        to="/classes#classes"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-purple-400 hover:bg-white/5 transition-all"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Campus</span>
                      </Link>
                      <Link
                        to="/classes#classes"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-all"
                      >
                        <Layers className="w-4 h-4" />
                        <span>Hybrid</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/5 p-4 space-y-2">
            <Link
              to="/admin/login"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-300 hover:text-white transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
