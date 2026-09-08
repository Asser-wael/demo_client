import { useEffect, useState } from "react";

const useCountUp = (endValue = 0, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericEnd = Number(endValue) || 0;
    if (numericEnd === 0) {
      setCount(0);
      return;
    }

    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // تطبيق تأثير Ease Out للعد بشكل طبيعي
      const easeOutQuad = 1 - Math.pow(1 - progress, 3); 
      setCount(Math.floor(easeOutQuad * numericEnd));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(numericEnd);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  return count;
};
export default useCountUp;