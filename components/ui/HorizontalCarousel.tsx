"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselSlide {
  src: string;
  alt: string;
  label?: string;
  caption?: string;
}

interface HorizontalCarouselProps {
  slides: CarouselSlide[];
  accentColor?: string;
  autoplayInterval?: number;
  showThumbnails?: boolean;
  className?: string;
}

export default function HorizontalCarousel({
  slides,
  accentColor = "#10B981",
  autoplayInterval = 4500,
  showThumbnails = true,
  className = "",
}: HorizontalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const total = slides.length;

  const goToSlide = useCallback(
    (idx: number) => {
      setCurrentIndex((idx + total) % total);
    },
    [total]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Autoplay fluide
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [total, autoplayInterval, isPaused]);

  // Swipe tactile mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      // Glissement vers la gauche -> image suivante
      nextSlide();
    } else if (distance < -45) {
      // Glissement vers la droite -> image précédente
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className={`w-full max-w-[420px] mx-auto select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── CONTENEUR PRINCIPAL DU CARROUSEL ── */}
      <div
        className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* RAIL DE DÉFILEMENT HORIZONTAL FLUIDE */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="w-full h-full shrink-0 relative bg-slate-100">
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
              {/* Badge indicatif sur la photo */}
              {slide.label && (
                <div className="absolute top-3.5 left-3.5 z-20 bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-ping"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span>{slide.label}</span>
                </div>
              )}
              {/* Légende en bas de l'image */}
              {slide.caption && (
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold text-center shadow-lg">
                  {slide.caption}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FLÈCHES DE NAVIGATION (SI PLUS D'1 IMAGE) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-20"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-20"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* ── PUCES INDICATRICES (DOTS) ── */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className="h-2 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: currentIndex === idx ? 28 : 8,
                backgroundColor: currentIndex === idx ? accentColor : "#CBD5E1",
              }}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── MINIATURES CLIQUABLES ── */}
      {showThumbnails && total > 1 && (
        <div className="flex gap-2 mt-3 justify-center overflow-x-auto pb-1">
          {slides.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0"
              style={{
                borderColor: currentIndex === idx ? accentColor : "transparent",
                opacity: currentIndex === idx ? 1 : 0.55,
                transform: currentIndex === idx ? "scale(1.05)" : "scale(1)",
              }}
              aria-label={s.alt}
            >
              <img src={s.src} alt={s.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
