"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScrollIndicatorProps {
  maxScroll: number;
}

export function ScrollIndicator({ maxScroll }: ScrollIndicatorProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const progress = Math.min((scrolled / maxScroll) * 100, 100);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [maxScroll]);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <div className="relative h-64 w-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-purple-400 to-pink-400 rounded-full"
          style={{ height: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}
