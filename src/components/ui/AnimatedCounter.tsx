import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  delay?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  delay = 0,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  // Parse raw value into prefix, target number, and suffix
  // e.g. "5,000+" -> prefix: "", target: 5000, suffix: "+"
  const valueStr = String(value);
  const match = valueStr.match(/^([^0-9]*)([\d,]+)(.*)$/);

  const prefix = match ? match[1] : '';
  const numStr = match ? match[2].replace(/,/g, '') : '';
  const targetNumber = numStr ? parseInt(numStr, 10) : null;
  const suffix = match ? match[3] : '';

  useEffect(() => {
    // If it's not a numeric string, just show original value
    if (targetNumber === null || isNaN(targetNumber)) {
      setDisplayValue(valueStr);
      return;
    }

    const currentElem = elementRef.current;
    if (!currentElem) return;

    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setHasStarted(true);
              if (observer) {
                observer.disconnect();
              }
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(currentElem);
    } else {
      // Fallback if IntersectionObserver is unavailable
      setHasStarted(true);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [targetNumber, valueStr]);

  useEffect(() => {
    if (!hasStarted || targetNumber === null || isNaN(targetNumber)) {
      return;
    }

    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      let startTime: number | null = null;

      // High-precision ease-out quart function for silky smooth deceleration
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

      const step = (currentTime: number) => {
        if (startTime === null) {
          startTime = currentTime;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);

        const currentVal = Math.round(easedProgress * targetNumber);
        setDisplayValue(`${prefix}${currentVal.toLocaleString()}${suffix}`);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(`${prefix}${targetNumber.toLocaleString()}${suffix}`);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [hasStarted, targetNumber, duration, delay, prefix, suffix]);

  return (
    <span ref={elementRef} className={className}>
      {hasStarted ? displayValue : `${prefix}0${suffix}`}
    </span>
  );
};
