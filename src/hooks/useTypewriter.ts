import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset state if text changes
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    let timeoutId: number;
    let intervalId: number;

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        if (indexRef.current < text.length) {
          setDisplayed((prev) => prev + text.charAt(indexRef.current));
          indexRef.current += 1;
        } else {
          setDone(true);
          window.clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
