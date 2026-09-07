import React, { useState, useEffect } from 'react';

const WORDS = [
  'AI Products',
  'Cloud Solutions',
  'Workshops & Events',
  'Training Programs',
];

const LONGEST_WORD = WORDS.reduce((a, b) => (a.length > b.length ? a : b), '');

export const HeroFeatureRotator: React.FC = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[wordIndex];

    if (!isDeleting && displayedText === currentWord) {
      // Finished typing full word, pause before backspacing
      const pauseTimer = setTimeout(() => {
        setIsDeleting(true);
      }, 1900);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting && displayedText === '') {
      // Finished deleting word, pause briefly before next word
      const nextWordTimer = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % WORDS.length);
      }, 350);
      return () => clearTimeout(nextWordTimer);
    }

    // Determine speed: faster when backspacing, natural when typing
    const speed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting
          ? currentWord.substring(0, prev.length - 1)
          : currentWord.substring(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, wordIndex]);

  return (
    <div className="flex items-center justify-center pt-2 pb-1 select-none">
      <div className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-slate-900/60 border border-white/[0.08] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-cyan-400/30 transition-all duration-300 text-center">
        {/* Pulsing micro-dot indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(0,217,255,0.8)]" />
        </span>

        {/* Clean monospace prefix */}
        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold whitespace-nowrap">
          Specialized in
        </span>

        {/* Stable width container to lock layout and prevent any jitter */}
        <span className="relative inline-flex items-center text-left">
          <span
            className="invisible select-none opacity-0 pointer-events-none font-heading font-semibold text-xs sm:text-sm md:text-[15px] tracking-tight whitespace-nowrap"
            aria-hidden="true"
          >
            {LONGEST_WORD}
          </span>

          <span className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap">
            <span className="font-heading font-semibold text-xs sm:text-sm md:text-[15px] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 tracking-tight">
              {displayedText}
            </span>
            <span
              className="inline-block w-[2px] h-3.5 sm:h-4 bg-cyan-400 ml-1 rounded-full animate-cursor-blink shadow-[0_0_8px_rgba(0,217,255,0.7)]"
              aria-hidden="true"
            />
          </span>
        </span>
      </div>
    </div>
  );
};
