"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 2.0, // Slower duration for smoother feel
        lerp: 0.05,    // More fluid lerp
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
