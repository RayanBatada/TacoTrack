"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function AnimatedBellIcon() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    const maxFrames = 6; // 3 images × 2 cycles = 6 total frames

    const interval = setInterval(() => {
      if (frameCount >= maxFrames) {
        clearInterval(interval);
        return;
      }

      setFrameIndex(frameCount % 3); // Always stays within 0, 1, 2
      frameCount++;
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const frames = ["/bell-1.png", "/bell-2.png", "/bell-3.png"];

  return (
    <Image
      src={frames[frameIndex]}
      alt="Animating bell"
      width={16}
      height={16}
      className="animate-pulse"
    />
  );
}
