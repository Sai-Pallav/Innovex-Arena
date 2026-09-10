import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ExternalLink, Code2, Layers, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../data/siteData';
import { Button } from '../components/ui/Button';
import { CyberCard } from '../components/ui/CyberCard';

export const ProductsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    { id: 'All', label: 'All Products' },
    { id: 'AI Solutions', label: 'AI Solutions' },
    { id: 'Cloud Tools', label: 'Cloud Tools' },
    { id: 'IoT Projects', label: 'IoT Projects' },
  ];

  const filteredProducts =
    activeCategory === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="relative pt-28 pb-20 space-y-20">
      {/* Background ultraviolet hero bloom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] ultraviolet-hero-bloom pointer-events-none -z-10" />

      {/* 1. HERO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4 animate-fade-up">
        <h1 className="font-rebond font-bold text-3xl sm:text-5xl tracking-tight text-white leading-[1.15]">
          Our <span className="cosmic-text-gradient">Products</span>
        </h1>
        <p className="text-sm sm:text-base text-[#9b96b0] max-w-2xl mx-auto leading-relaxed">
          Explore the innovative solutions we&apos;ve built using AI, cloud computing, and emerging technologies.
        </p>
      </section>

      {/* 2. CATEGORY TABS - Wope 999px Glass Pills */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex justify-center animate-fade-up animation-delay-100">
        <div className="inline-flex flex-wrap justify-center p-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] backdrop-blur-md gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-white/[0.08] text-white font-semibold border border-[#9382ff]/50 shadow-[inset_0_-7px_11px_rgba(164,143,255,0.18),0_0_15px_rgba(147,130,255,0.2)]'
                  : 'text-[#9b96b0] border border-transparent hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. PRODUCT CARDS GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-stretch">
          {filteredProducts.map((product) => (
            <CyberCard
              key={product.id}
              glow="cyan"
              className="p-6 sm:p-7 group flex flex-col justify-between"
            >
              <div className="flex-1">
                {product.imageUrl && (
                  <div className="w-full h-48 sm:h-56 rounded-[16px] overflow-hidden mb-5 border border-white/[0.08] bg-black/40">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-3.5">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/[0.04] border border-white/[0.12] text-[#b7a4fb] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#9382ff]/10 border border-[#9382ff]/30 text-[#ba9cff]">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="font-rebond font-bold text-xl sm:text-2xl text-white group-hover:text-[#b7a4fb] transition-colors tracking-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs font-mono text-[#b7a4fb]/90 mt-1 uppercase tracking-wider font-medium">
                    {product.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#9b96b0] leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 pt-3 border-t border-white/[0.06] mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#b7a4fb]" /> Key Capabilities
                  </h4>
                  <ul className="space-y-1.5">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#9b96b0]">
                        <CheckCircle2 className="w-4 h-4 text-[#b7a4fb] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Badges - 999px Pills */}
                <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[#b7a4fb]" /> Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-mono bg-white/[0.04] border border-white/[0.1] text-[#9b96b0]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between">
                <Link to="/contact">
                  <Button variant="hero" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Inquire Demo
                  </Button>
                </Link>
                <Link to="/contact" className="text-xs font-medium text-[#9b96b0] hover:text-[#b7a4fb] transition-colors">
                  Request Custom Build →
                </Link>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* 4. PRODUCTS CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="relative rounded-2xl p-8 sm:p-12 overflow-hidden border border-white/[0.12] bg-[#0a0118] backdrop-blur-xl shadow-[inset_0_0_24px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.8)] text-center space-y-4 hover:border-[#9382ff]/40 transition-all">
          <div className="aurora-divider-line absolute top-0 left-0 right-0" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#9382ff]/50 to-transparent pointer-events-none" />

          <h2 className="font-rebond font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Have a <span className="cosmic-text-gradient">Project Idea?</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#9b96b0] max-w-xl mx-auto leading-relaxed">
            Let&apos;s collaborate and build something amazing together. We&apos;re always looking for innovative projects to work on.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <Button variant="hero" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
