"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/conference/venue/aerial.webp", alt: "The Belgrove Resort aerial view" },
  { src: "/conference/venue/ballroom.webp", alt: "Conference ballroom, classroom setup" },
  { src: "/conference/venue/lobby.webp", alt: "Resort lobby lounge" },
  { src: "/conference/venue/pool.webp", alt: "Aerial view of the resort pools" },
];

export function VenueSlider() {
  const [index, setIndex] = useState(0);
  const count = SLIDES.length;

  const go = useCallback(
    (delta: number) => setIndex((p) => (p + delta + count) % count),
    [count],
  );

  useEffect(() => {
    const timer = setInterval(() => setIndex((p) => (p + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="group relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm">
      {SLIDES.map((s, i) => (
        <Image
          key={s.src}
          src={s.src}
          alt={s.alt}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className={cn(
            "object-cover transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0",
          )}
          priority={i === 0}
        />
      ))}

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-navy opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next image"
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-navy opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-2.5 cursor-pointer rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/90",
            )}
          />
        ))}
      </div>
    </div>
  );
}
