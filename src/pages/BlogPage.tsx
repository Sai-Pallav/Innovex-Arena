import React, { useState } from 'react';
import { Calendar, Tag, ArrowRight, X } from 'lucide-react';
import { BLOG_POSTS } from '../data/siteData';
import { CyberCard } from '../components/ui/CyberCard';
import { Button } from '../components/ui/Button';
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
    <div className="relative pt-28 pb-20 space-y-20">
      {/* 1. HERO (EXACT LIVE SITE COPY) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4 animate-fade-up">
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-white leading-[1.15]">
          Blog & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">News</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stay updated with the latest tech articles, event announcements, industry insights, and company updates.
        </p>
      </section>

      {/* 2. FILTER TABS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex justify-center animate-fade-up animation-delay-100">
        <div className="inline-flex flex-wrap justify-center p-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/30 shadow-[0_0_12px_rgba(0,217,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {cat === 'All' ? 'All Posts' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. BLOG POSTS GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {filteredPosts.map((post) => (
            <CyberCard
              key={post.id}
              glow="cyan"
              className="p-0 overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-black/40">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/70 border border-white/[0.1] text-cyan-300 backdrop-blur-md">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span>{post.published_at}</span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 border-t border-white/[0.06] mt-4">
                <button
                  onClick={() => setSelectedPost(post)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer pt-3"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </CyberCard>
          ))}
        </div>
      </section>

      {/* Read Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-[#080c18] border border-white/[0.12] shadow-2xl max-h-[85vh] flex flex-col">
            <div className="relative h-56 shrink-0 overflow-hidden">
              <img
                src={selectedPost.cover_image}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                  {selectedPost.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {selectedPost.published_at}
                </span>
              </div>

              <h2 className="font-heading font-bold text-xl sm:text-2xl text-white">
                {selectedPost.title}
              </h2>

              <p className="text-xs sm:text-sm text-cyan-300/90 font-medium italic border-l-2 border-cyan-400 pl-3">
                {selectedPost.excerpt}
              </p>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
