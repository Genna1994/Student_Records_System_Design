import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface TerminalDecodeProps {
  text: string;
  duration?: number;
  className?: string;
}

export function TerminalDecode({ text, duration = 1.2, className = "" }: TerminalDecodeProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const totalChars = text.length;
    const intervalTime = (duration * 1000) / totalChars;
    let currentIndex = 0;

    const interval = setInterval(() => {
      const newText = text
        .split("")
        .map((char, i) => {
          if (i < currentIndex) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayText(newText);
      currentIndex++;

      if (currentIndex > totalChars) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, duration]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {displayText || "_"}
    </motion.span>
  );
}
