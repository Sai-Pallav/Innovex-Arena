import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { TestimonialItem } from '../../types';
import { CyberCard } from '../ui/CyberCard';

interface TestimonialsInfiniteMarqueeProps {
  items: TestimonialItem[];
  title?: string;
  subtitle?: string;
  speed?: number; // Pixels per frame (~60fps)
}

export const TestimonialsInfiniteMarquee: React.FC<TestimonialsInfiniteMarqueeProps> = ({
  items,
  title = 'What Our Community Says',
  subtitle = 'Hear from students and professionals who have participated in our workshops, hackathons, and training programs.',
  speed = 0.85,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  // Repeat the testimonials array 4 times for seamless continuous looping
  const repeatedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    return [...items, ...items, ...items, ...items];
  }, [items]);

  // Measure single set width
  const getSingleSetWidth = useCallback(() => {
    if (!trackRef.current || items.length === 0) return 0;
    return trackRef.current.scrollWidth / 4;
  }, [items.length]);

  // Initialize scroll position to the second set for seamless bidirectional wrapping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      const setWidth = getSingleSetWidth();
      if (setWidth > 0 && el.scrollLeft < setWidth * 0.5) {
        el.scrollLeft = setWidth;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [getSingleSetWidth]);

  // RequestAnimationFrame animation loop for smooth right-to-left infinite motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const animate = () => {
      const el = containerRef.current;
      if (el && !isHovered && !isManualPaused && !isDragging) {
        const setWidth = getSingleSetWidth();
        el.scrollLeft += speed;

        // When we've scrolled past 2 full sets, loop seamlessly back by 1 set
        if (setWidth > 0 && el.scrollLeft >= setWidth * 2.5) {
          el.scrollLeft -= setWidth;
        }
      }
      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isHovered, isManualPaused, isDragging, speed, getSingleSetWidth]);

  // Trigger manual scroll and temporarily pause the continuous loop
  const handleScrollStep = useCallback(
    (direction: 'left' | 'right') => {
      const el = containerRef.current;
      if (!el) return;

      setIsManualPaused(true);

      // Determine responsive scroll distance (approximately one card width + gap)
      const cardWidth = window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 360 : 400;
      const setWidth = getSingleSetWidth();

      if (direction === 'left') {
        // If scrolling left near the start, shift forward by one full set to prevent hit wall
        if (setWidth > 0 && el.scrollLeft <= setWidth * 0.4) {
          el.scrollLeft += setWidth;
        }
        el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      } else {
        // If scrolling right near the end, reset back by one full set
        if (setWidth > 0 && el.scrollLeft >= setWidth * 2.8) {
          el.scrollLeft -= setWidth;
        }
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }

      // Resume auto-scrolling automatically after 3.5 seconds of user inactivity
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        setIsManualPaused(false);
      }, 3500);
    },
    [getSingleSetWidth]
  );

  // Mouse drag handlers for desktop swipe/grab feel
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollStart(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollStart - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full space-y-8 select-none">
      {/* Section Header with Clean Centered Title (Pause Button & Label Removed) */}
      <div className="text-center space-y-2 max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="font-heading font-medium text-2xl sm:text-3xl lg:text-4xl text-white tracking-[-0.015em]">
          {title.includes('Community Says') ? (
            <>
              What Our{' '}
              <span className="cosmic-text-gradient">
                Community Says
              </span>
            </>
          ) : (
            title
          )}
        </h2>
        <p className="text-xs sm:text-sm text-[#9b96b0] max-w-xl mx-auto">{subtitle}</p>
      </div>

      {/* Infinite Carousel Showcase Wrapper with Left and Right Side Buttons */}
      <div
        className="relative w-full overflow-hidden group/carousel py-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUpOrLeave();
        }}
      >
        {/* Ambient Left Edge Gradient Fade Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#060212] via-[#060212]/85 to-transparent z-20" />

        {/* Left Arrow Button Placed on the Left Side (Always Visible) */}
        <button
          onClick={() => handleScrollStep('left')}
          aria-label="Previous testimonial"
          title="Scroll left"
          className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#0c0818]/80 hover:bg-[#18112e] text-[#c4c0d4] hover:text-white border border-white/[0.08] hover:border-white/[0.2] shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer group/btn"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:-translate-x-0.5 transition-transform duration-200" />
        </button>

        {/* Ambient Right Edge Gradient Fade Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#060212] via-[#060212]/85 to-transparent z-20" />

        {/* Right Arrow Button Placed on the Right Side (Always Visible) */}
        <button
          onClick={() => handleScrollStep('right')}
          aria-label="Next testimonial"
          title="Scroll right"
          className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#0c0818]/80 hover:bg-[#18112e] text-[#c4c0d4] hover:text-white border border-white/[0.08] hover:border-white/[0.2] shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer group/btn"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
        </button>

        {/* Horizontally Scrollable Marquee Track */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className={`flex overflow-x-auto scrollbar-none scroll-smooth py-6 sm:py-8 px-6 sm:px-14 md:px-20 cursor-grab active:cursor-grabbing ${
            isDragging ? 'select-none' : ''
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div ref={trackRef} className="flex gap-4 sm:gap-5 items-stretch shrink-0">
            {repeatedItems.map((testimonial, idx) => {
              return (
                <div
                  key={`${testimonial.id}-${idx}`}
                  className="w-[280px] sm:w-[340px] md:w-[380px] shrink-0 flex flex-col relative transition-all duration-200 hover:z-20 group/item"
                >
                  <div
                    className="p-5 sm:p-6 flex-1 flex flex-col justify-between h-full rounded-2xl bg-[rgba(12,8,24,0.75)] border border-white/[0.07] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer hover:-translate-y-1 relative overflow-hidden backdrop-blur-md"
                  >
                    {/* Top rating & Quote Badge */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 text-[#b7a4fb]">
                          {[...Array(testimonial.rating || 5)].map((_, starIdx) => (
                            <Star
                              key={starIdx}
                              className="w-3.5 h-3.5 fill-[#b7a4fb] text-[#b7a4fb]"
                            />
                          ))}
                        </div>

                        {/* Subtle decorative quote mark */}
                        <div className="w-6 h-6 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#85808c] group-hover/item:text-[#b7a4fb] transition-colors">
                          <Quote className="w-3 h-3 opacity-60" />
                        </div>
                      </div>

                      {/* Content Quote */}
                      <p className="text-xs sm:text-[13px] text-[#dcd7ee] leading-relaxed mb-5 line-clamp-4 min-h-[4.5rem]">
                        &quot;{testimonial.content}&quot;
                      </p>
                    </div>

                    {/* Footer Author Profile */}
                    <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center gap-3">
                      {/* Avatar Circle with Initial */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-heading text-xs font-medium text-white shrink-0 bg-white/[0.06] border border-white/[0.12]"
                      >
                        {testimonial.name.charAt(0)}
                      </div>

                      {/* Author Details */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading text-xs sm:text-[13px] font-medium text-[#ffffff] truncate">
                          {testimonial.name}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-[#9b96b0] truncate">
                            {testimonial.role}
                          </span>
                          <span className="text-white/20 text-[10px]">•</span>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.03] text-[#b7a4fb] border border-white/[0.08] truncate"
                          >
                            {testimonial.companyOrCollege}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
