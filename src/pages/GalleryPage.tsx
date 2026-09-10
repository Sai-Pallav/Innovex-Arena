import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/siteData';
import { GalleryItem } from '../types';

export const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Workshop', 'Hackathon', 'Bootcamp', 'Event'];

  const filteredItems =
    activeCategory === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  const handlePrev = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((it) => it.id === selectedItem.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
    setSelectedItem(filteredItems[prevIndex]);
  };

  const handleNext = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((it) => it.id === selectedItem.id);
    const nextIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
    setSelectedItem(filteredItems[nextIndex]);
  };

  return (
    <div className="relative pt-28 pb-24 space-y-16">
      {/* Background Hero Bloom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 ultraviolet-hero-bloom pointer-events-none" />

      {/* 1. HERO */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4 animate-fade-up">
        <h1 className="font-rebond font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.15]">
          Our <span className="cosmic-text-gradient">Gallery</span>
        </h1>
        <p className="text-sm sm:text-base text-[#9b96b0] max-w-2xl mx-auto leading-relaxed">
          Explore moments from our workshops, hackathons, and events. See the innovation and creativity in action.
        </p>
      </section>

      {/* 2. FILTER TABS (999px capsule pills) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex justify-center animate-fade-up animation-delay-100">
        <div className="inline-flex flex-wrap justify-center p-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] backdrop-blur-md gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#713dff] text-white font-semibold shadow-[0_0_20px_rgba(113,61,255,0.4)] border border-[#b7a4fb]/40'
                  : 'text-[#9b96b0] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. GALLERY GRID (16px cards with inset rim glow & bottom underglow) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-[#0a0118] border border-white/[0.08] hover:border-white/[0.18] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(113,61,255,0.2)]"
              style={{ boxShadow: 'inset 0 0 24px rgba(255,255,255,0.03)' }}
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative h-64 overflow-hidden bg-black/40">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] via-[#0a0118]/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                <div className="absolute top-3.5 right-3.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0a0118]/80 border border-white/[0.15] text-[#ba9cff] backdrop-blur-md shadow-[0_0_12px_rgba(113,61,255,0.25)]">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1.5">
                  <h3 className="font-rebond font-bold text-base text-white group-hover:text-[#ba9cff] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#9b96b0] line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="card-underglow-beam" />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div
            className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-[#0a0118] border border-white/[0.14] shadow-2xl"
            style={{ boxShadow: 'inset 0 0 24px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.8)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ba9cff]/60 to-transparent" />
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-white flex items-center justify-center border border-white/[0.15] transition-all cursor-pointer shadow-[0_0_12px_rgba(113,61,255,0.3)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative h-80 sm:h-96">
              <img
                src={selectedItem.thumbnail}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] via-transparent to-transparent opacity-80" />
            </div>

            <div className="p-6 sm:p-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#713dff]/20 text-[#ba9cff] border border-[#713dff]/40">
                  {selectedItem.category}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-slate-300 hover:text-white border border-white/[0.1] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-slate-300 hover:text-white border border-white/[0.1] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h2 className="font-rebond font-bold text-xl sm:text-2xl text-white">
                {selectedItem.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#9b96b0] leading-relaxed">
                {selectedItem.description}
              </p>
            </div>
            <div className="card-underglow-beam" />
          </div>
        </div>
      )}
    </div>
  );
};
