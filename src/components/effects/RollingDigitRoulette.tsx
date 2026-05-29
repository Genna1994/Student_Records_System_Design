import { useState, useEffect, useRef } from "react";

interface RollingDigitRouletteProps {
  value: string | number;
  delay?: number;
  className?: string;
  digitClassName?: string;
}

export function RollingDigitRoulette({
  value,
  delay = 0,
  className = "",
  digitClassName = "",
}: RollingDigitRouletteProps) {
  const digits = String(value).split("");
  const [displayDigits, setDisplayDigits] = useState<string[]>(
    digits.map(() => "0")
  );
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplayDigits(String(value).split(""));
      return;
    }
    hasAnimated.current = true;

    const timeout = setTimeout(() => {
      const duration = 1200;
      const intervalTime = 30;
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += intervalTime;

        const newDigits = digits.map((char) => {
          if (!/\d/.test(char)) return char;
          if (elapsed >= duration) return char;
          return Math.floor(Math.random() * 10).toString();
        });

        setDisplayDigits(newDigits);

        if (elapsed >= duration) {
          clearInterval(interval);
          setDisplayDigits(digits);
        }
      }, intervalTime);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <span className={`inline-flex overflow-hidden font-mono ${className}`}>
      {displayDigits.map((digit, i) => (
        <span
          key={`digit-${i}-${value}`}
          className={`inline-block w-[0.6em] text-center ${digitClassName}`}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}
