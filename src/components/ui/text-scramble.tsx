"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";

interface TextScrambleProps {
  text: string;
  duration?: number;
  delay?: number;
  className?: string;
  triggerOnce?: boolean;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";

export const TextScramble = ({
  text,
  duration = 0.8,
  delay = 0,
  className = "",
  triggerOnce = true,
}: TextScrambleProps) => {
  const [displayText, setDisplayText] = useState(text);
  const { isLoading } = useLoading();
  const hasAnimated = useRef(false);

  const scramble = useCallback(async () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const steps = 15;
    const stepDuration = (duration * 1000) / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const scrambled = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (index / text.length < progress) return char;
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join("");

      setDisplayText(scrambled);
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
    }

    setDisplayText(text);
  }, [text, duration]);

  useEffect(() => {
    if (!isLoading && !hasAnimated.current) {
      const timer = setTimeout(() => {
        scramble();
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, scramble, delay]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={!isLoading ? { opacity: 1 } : { opacity: 0 }}
      className={className}
    >
      {displayText}
    </motion.span>
  );
};
