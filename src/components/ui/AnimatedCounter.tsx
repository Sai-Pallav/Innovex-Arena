import React, { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  delay?: number;
  className?: string;
  startImmediately?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = React.memo(({
  value,
  duration = 2400,
  delay = 0,
  className,
  startImmediately = false,
}) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const valueStr = String(value);

  // Parse raw value into prefix, target number, and suffix (memoized)
  const { prefix, targetNumber, suffix } = React.useMemo(() => {
    const match = valueStr.match(/^([^0-9]*)([\d,]+)(.*)$/);
    return {
      prefix: match ? match[1] : '',
      targetNumber: match ? parseInt(match[2].replace(/,/g, ''), 10) : null,
      suffix: match ? match[3] : '',
    };
  }, [valueStr]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If it's not a numeric string, just show original value
    if (targetNumber === null || isNaN(targetNumber)) {
      element.textContent = valueStr;
      return;
    }

    let animationFrameId: number | null = null;
    let timeoutId: any = null;
    let observer: IntersectionObserver | null = null;
    let hasStartedAnimation = false;

    // Smoothstep curve (t * t * (3 - 2 * t)): starts gently from 0, rolls with steady momentum, and smoothly settles without erratic rushing
    const smoothCurve = (t: number) => t * t * (3 - 2 * t);

    const startCounting = () => {
      if (hasStartedAnimation) return;
      hasStartedAnimation = true;

      const runAnimation = () => {
        let startTime: number | null = null;

        const step = (currentTime: number) => {
          if (startTime === null) {
            startTime = currentTime;
          }

          const elapsed = currentTime - startTime;
          const progress = Math.min(Math.max(elapsed / duration, 0), 1);
          const easedProgress = smoothCurve(progress);

          const currentVal = Math.round(easedProgress * targetNumber);
          if (elementRef.current) {
            elementRef.current.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;
          }

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(step);
          } else {
            if (elementRef.current) {
              elementRef.current.textContent = `${prefix}${targetNumber.toLocaleString()}${suffix}`;
            }
          }
        };

        animationFrameId = requestAnimationFrame(step);
      };

      if (delay > 0) {
        timeoutId = setTimeout(runAnimation, delay);
      } else {
        runAnimation();
      }
    };

    // Check if element is already in viewport on mount or startImmediately is explicitly requested
    const rect = element.getBoundingClientRect();
    const isInitiallyInViewport =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (startImmediately || isInitiallyInViewport) {
      startCounting();
    } else if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (let i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              startCounting();
              if (observer) {
                observer.disconnect();
                observer = null;
              }
              break;
            }
          }
        },
        { threshold: 0.05, rootMargin: '40px' }
      );
      observer.observe(element);
    } else {
      startCounting();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (observer) observer.disconnect();
    };
  }, [targetNumber, valueStr, duration, delay, prefix, suffix, startImmediately]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
});
