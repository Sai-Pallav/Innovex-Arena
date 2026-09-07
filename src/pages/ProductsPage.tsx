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
      {/* 1. HERO (EXACT LIVE SITE COPY) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4 animate-fade-up">
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-white leading-[1.15]">
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">Products</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Explore the innovative solutions we&apos;ve built using AI, cloud computing, and emerging technologies.
        </p>
      </section>

      {/* 2. CATEGORY TABS (EXACT LIVE FILTER TABS) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex justify-center animate-fade-up animation-delay-100">
        <div className="inline-flex flex-wrap justify-center p-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/30 shadow-[0_0_12px_rgba(0,217,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
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
                  <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden mb-5 border border-white/[0.08] bg-black/40">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-3.5">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-foreground group-hover:text-cyan-300 transition-colors tracking-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400/80 mt-1 uppercase tracking-wider font-medium">
                    {product.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 pt-3 border-t border-white/[0.06] mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Key Capabilities
                  </h4>
                  <ul className="space-y-1.5">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Badges */}
                <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-primary" /> Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-slate-300"
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
                <Link to="/contact" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                  Request Custom Build →
                </Link>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* 4. PRODUCTS CTA (EXACT LIVE SITE COPY) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-white/[0.08] bg-[#0b101e]/80 backdrop-blur-xl text-center space-y-4">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            Have a Project Idea?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
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
