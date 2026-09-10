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
    <div className="flex items-center justify-center pt-1.5 pb-0.5 select-none">
      <div className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.025] border border-white/[0.08] backdrop-blur-md transition-colors duration-200 hover:border-white/[0.16] text-center">
        {/* Quiet focused indicator dot */}
        <span className="h-1.5 w-1.5 rounded-full bg-[#9382ff] shrink-0" />

        {/* Restrained utility label */}
        <span className="text-[11px] sm:text-xs text-[#9b96b0] font-medium tracking-normal whitespace-nowrap">
          Specialized in:
        </span>

        {/* Stable width container to lock layout and prevent any jitter */}
        <span className="relative inline-flex items-center text-left">
          <span
            className="invisible select-none opacity-0 pointer-events-none font-medium text-xs sm:text-sm tracking-tight whitespace-nowrap"
            aria-hidden="true"
          >
            {LONGEST_WORD}
          </span>

          <span className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap">
            <span className="font-medium text-xs sm:text-sm text-[#f4f0ff] tracking-tight">
              {displayedText}
            </span>
            <span
              className="inline-block w-[1.5px] h-3.5 bg-[#b7a4fb] ml-1 rounded-full animate-cursor-blink"
              aria-hidden="true"
            />
          </span>
        </span>
      </div>
    </div>
  );
};
