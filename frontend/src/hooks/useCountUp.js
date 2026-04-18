import { useState, useEffect, useRef } from 'react';

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start   = prevRef.current;
    const end     = Number(target) || 0;
    const delta   = end - start;
    if (delta === 0) return;

    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setCount(Math.round(start + delta * ease));
      if (progress < 1) requestAnimationFrame(step);
      else prevRef.current = end;
    }

    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

export default useCountUp;
