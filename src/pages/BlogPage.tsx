import React, { useState } from 'react';
import { Calendar, ArrowRight, X } from 'lucide-react';
import { BLOG_POSTS } from '../data/siteData';
import { BlogPostItem } from '../types';

export const BlogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(null);

  const categories = ['All', 'Technology', 'Events', 'Careers'];

  const filteredPosts =
    activeCategory === 'All'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === activeCategory);

  return (
    <div className="relative pt-28 pb-24 space-y-16">
      {/* Background Hero Bloom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 ultraviolet-hero-bloom pointer-events-none" />

      {/* 1. HERO */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4 animate-fade-up">
        <h1 className="font-rebond font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.15]">
          Blog & <span className="cosmic-text-gradient">News</span>
        </h1>
        <p className="text-sm sm:text-base text-[#9b96b0] max-w-2xl mx-auto leading-relaxed">
          Stay updated with the latest tech articles, event announcements, industry insights, and company updates.
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
              {cat === 'All' ? 'All Posts' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. BLOG POSTS GRID (16px cards with inset rim glow & bottom underglow) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group relative rounded-2xl bg-[#0a0118] border border-white/[0.08] hover:border-white/[0.18] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(113,61,255,0.2)]"
              style={{ boxShadow: 'inset 0 0 24px rgba(255,255,255,0.03)' }}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-black/40">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0a0118]/80 border border-white/[0.15] text-[#ba9cff] backdrop-blur-md shadow-[0_0_12px_rgba(113,61,255,0.25)]">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-[#9b96b0]">
                    <Calendar className="w-3.5 h-3.5 text-[#b7a4fb]" />
                    <span>{post.published_at}</span>
                  </div>

                  <h3 className="font-rebond font-bold text-lg text-white group-hover:text-[#ba9cff] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#9b96b0] line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/[0.06] mt-4">
                <button
                  onClick={() => setSelectedPost(post)}
                  className="text-xs font-semibold text-[#ba9cff] hover:text-[#e59cff] flex items-center gap-1.5 cursor-pointer pt-3 transition-colors"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              <div className="card-underglow-beam" />
            </div>
          ))}
        </div>
      </section>

      {/* Read Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-[#0a0118] border border-white/[0.14] shadow-2xl max-h-[85vh] flex flex-col"
            style={{ boxShadow: 'inset 0 0 24px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.8)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ba9cff]/60 to-transparent" />
            <div className="relative h-56 shrink-0 overflow-hidden">
              <img
                src={selectedPost.cover_image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] via-transparent to-transparent opacity-80" />
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#0a0118]/80 hover:bg-white/[0.15] text-white flex items-center justify-center border border-white/[0.15] transition-all cursor-pointer shadow-[0_0_12px_rgba(113,61,255,0.3)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-7 overflow-y-auto space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#713dff]/20 text-[#ba9cff] border border-[#713dff]/40">
                  {selectedPost.category}
                </span>
                <span className="text-[#9b96b0] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#b7a4fb]" />
                  {selectedPost.published_at}
                </span>
              </div>

              <h2 className="font-rebond font-bold text-xl sm:text-2xl text-white leading-tight">
                {selectedPost.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#ba9cff]/90 font-medium italic border-l-2 border-[#b7a4fb] pl-3 py-0.5">
                {selectedPost.excerpt}
              </p>

              <div className="text-xs sm:text-sm text-[#9b96b0] leading-relaxed whitespace-pre-line space-y-2">
                {selectedPost.content}
              </div>
            </div>
            <div className="card-underglow-beam" />
          </div>
        </div>
      )}
    </div>
  );
};
