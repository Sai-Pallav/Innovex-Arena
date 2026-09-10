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
    setActiveSection(location.pathname);
  }, [location.pathname]);

  const isLinkActive = (href: string) => {
    return location.pathname === href;
  };

  const handleNavClick = (
    _e: React.MouseEvent<HTMLAnchorElement>,
    _href: string,
    isMobile: boolean = false
  ) => {
    if (isMobile) {
      setIsMobileOpen(false);
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
              ? 'bg-gradient-to-b from-[#060212]/95 via-[#060212]/90 to-[#060212]/80 backdrop-blur-xl border-b border-white/[0.06]'
              : 'bg-gradient-to-b from-[#060212]/40 via-[#060212]/20 to-transparent backdrop-blur-md'
          }`}
        />

        {/* Top Border Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b7a4fb]/30 to-transparent transition-opacity duration-500 ${
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#713dff]/20 to-[#8562ff]/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#713dff] to-[#8562ff] flex items-center justify-center shadow-[0_0_16px_rgba(113,61,255,0.4)] group-hover:shadow-[0_0_24px_rgba(113,61,255,0.6)] transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                  Innovex Arena
                </span>
                <span className="text-[10px] font-medium tracking-wider text-[#9b96b0] uppercase leading-none mt-1">
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
                        group/link relative px-3 xl:px-4 py-1.5 rounded-full text-sm font-medium
                        transition-all duration-200 flex items-center gap-1.5
                        ${
                          isActive
                            ? 'text-white'
                            : 'text-[#9b96b0] hover:text-white'
                        }
                      `}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-white/[0.05] border border-[#b7a4fb]/30 shadow-[inset_0_0_12px_rgba(183,164,251,0.08)]" />
                      )}
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-full bg-white/0 group-hover/link:bg-white/[0.04] transition-colors duration-200" />
                      
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
                        <div className="rounded-[16px] bg-[#0a0118]/95 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] overflow-hidden">
                          <div className="p-2 space-y-1">
                            <Link
                              to="/classes#classes"
                              className="flex items-start gap-3 p-3 rounded-[5px] hover:bg-white/5 transition-all duration-200 group/item"
                            >
                              <div className="w-10 h-10 rounded-[5px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7a4fb] shrink-0">
                                <Video className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#f4f0ff] group-hover/item:text-[#b7a4fb] transition-colors">
                                  Live Online Classes
                                </div>
                                <p className="text-xs text-[#918ea0] mt-0.5 leading-relaxed">
                                  Interactive sessions with expert instructors
                                </p>
                              </div>
                            </Link>

                            <Link
                              to="/classes#classes"
                              className="flex items-start gap-3 p-3 rounded-[5px] hover:bg-white/5 transition-all duration-200 group/item"
                            >
                              <div className="w-10 h-10 rounded-[5px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#9382ff] shrink-0">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#f4f0ff] group-hover/item:text-[#9382ff] transition-colors">
                                  Campus Programs
                                </div>
                                <p className="text-xs text-[#918ea0] mt-0.5 leading-relaxed">
                                  Hands-on learning in premium facilities
                                </p>
                              </div>
                            </Link>

                            <Link
                              to="/classes#classes"
                              className="flex items-start gap-3 p-3 rounded-[5px] hover:bg-white/5 transition-all duration-200 group/item"
                            >
                              <div className="w-10 h-10 rounded-[5px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8562ff] shrink-0">
                                <Layers className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#f4f0ff] group-hover/item:text-[#8562ff] transition-colors">
                                  Hybrid Cohorts
                                </div>
                                <p className="text-xs text-[#918ea0] mt-0.5 leading-relaxed">
                                  Online theory + weekend campus labs
                                </p>
                              </div>
                            </Link>
                          </div>

                          <div className="border-t border-white/5 p-3">
                            <Link
                              to="/classes"
                              className="flex items-center justify-between text-xs font-semibold text-[#b7a4fb] hover:text-[#f4f0ff] transition-colors group/more"
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
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#b7a4fb]/40 flex items-center justify-center text-[#9b96b0] hover:text-[#b7a4fb] transition-all duration-200 group"
                title="Admin Portal"
              >
                <Shield className="w-4.5 h-4.5" />
              </Link>

              <Link to="/contact">
                <span className="wope-glass-cta-pill px-6 py-2 text-sm group">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 text-[#b7a4fb] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-200"
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
          className={`absolute inset-0 bg-[#030014]/90 backdrop-blur-md transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`
            absolute top-20 left-4 right-4 max-h-[calc(100vh-6rem)] overflow-y-auto
            rounded-[16px] bg-[#060317]/95 backdrop-blur-xl border border-white/10
            shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] transition-all duration-300
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
                      flex items-center justify-between px-4 py-3 rounded-[5px]
                      text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-[#10093a] text-[#f4f0ff] border border-[#9382ff]/30 shadow-[inset_0_0_12px_rgba(147,130,255,0.12)]'
                          : 'text-[#9b96b0] hover:text-[#f4f0ff] hover:bg-white/5'
                      }
                    `}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9382ff]" />
                    )}
                  </Link>

                  {hasDropdown && (
                    <div className="mt-2 ml-4 space-y-1 pb-2 border-l-2 border-white/5 pl-4">
                      <Link
                        to="/classes#classes"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs text-[#918ea0] hover:text-[#b7a4fb] hover:bg-white/5 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Live Online</span>
                      </Link>
                      <Link
                        to="/classes#classes"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs text-[#918ea0] hover:text-[#9382ff] hover:bg-white/5 transition-all"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Campus</span>
                      </Link>
                      <Link
                        to="/classes#classes"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs text-[#918ea0] hover:text-[#8562ff] hover:bg-white/5 transition-all"
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
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[5px] bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-[#9b96b0] hover:text-[#f4f0ff] transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[5px] reflect-primary-btn text-sm font-medium transition-all"
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
