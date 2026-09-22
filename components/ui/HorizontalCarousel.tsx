"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselSlide {
  src: string;
  alt: string;
  label?: string;
}

export interface HorizontalCarouselProps {
  slides: CarouselSlide[];
  accentColor?: string;
  autoplayInterval?: number;
  className?: string;
}

export default function HorizontalCarousel({
  slides,
  accentColor = "#0047AB",
  autoplayInterval = 4500,
  className = "",
}: HorizontalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (total <= 1 || isPaused || autoplayInterval <= 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [total, isPaused, autoplayInterval, nextSlide]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className={`relative w-full max-w-lg mx-auto select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Conteneur de l'image principale */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 shadow-lg border border-slate-200/80">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt || `Slide ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              priority={idx === 0}
              className="object-cover"
            />
            {slide.label && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl text-center shadow-md">
                {slide.label}
              </div>
            )}
          </div>
        ))}

        {/* Boutons de navigation Flèches */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition active:scale-95"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition active:scale-95"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Compteur badge discret */}
        <div className="absolute top-3 right-3 z-20 bg-slate-950/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
          {currentIndex + 1} / {total}
        </div>
      </div>

      {/* Miniatures / Indicateurs sous l'image */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3 px-1">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  isActive
                    ? "border-current shadow-md scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                style={{ color: isActive ? accentColor : undefined }}
                aria-label={`Aller à la slide ${idx + 1}`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt || `Miniature ${idx + 1}`}
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
