"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface CloudVideoPlayerProps {
  youtubeId?: string;
  localSrc?: string;
  poster: string;
  title?: string;
  aspectRatio?: "16/9" | "9/16" | "4/5" | "1/1";
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  liveBadgeText?: string;
}

export default function CloudVideoPlayer({
  youtubeId,
  localSrc,
  poster,
  title = "Démonstration produit",
  aspectRatio = "16/9",
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true,
  className = "",
  liveBadgeText = "Test en direct",
}: CloudVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay && Boolean(youtubeId));

  const aspectClasses = {
    "16/9": "aspect-video",
    "9/16": "aspect-[9/16]",
    "4/5": "aspect-[4/5]",
    "1/1": "aspect-square",
  }[aspectRatio];

  const handleStartPlay = () => {
    setIsPlaying(true);
  };

  return (
    <div
      className={`relative w-full ${aspectClasses} rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-200/80 group select-none ${className}`}
      style={{
        boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 8px 32px -4px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* 🟢 Badge Live Réassurance */}
      {liveBadgeText && (
        <div className="absolute top-3.5 left-3.5 bg-slate-950/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 z-20 pointer-events-none border border-white/10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="tracking-tight">{liveBadgeText}</span>
        </div>
      )}

      {/* Mode 1: YouTube Embed Sans Bande Passante Vercel (Illimité & Gratuit) */}
      {youtubeId ? (
        isPlaying ? (
          <iframe
            className="w-full h-full border-0 absolute inset-0"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${youtubeId}&playsinline=1&controls=${controls ? 1 : 0}&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          /* Façade d'attente (0 octet consommé jusqu'au clic !) */
          <div
            onClick={handleStartPlay}
            className="relative w-full h-full cursor-pointer flex items-center justify-center group"
          >
            <Image
              src={poster}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
              priority={false}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            
            {/* Bouton Play Figma-Grade */}
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-slate-900 shadow-2xl flex items-center justify-center pl-1 group-hover:scale-110 group-active:scale-95 transition-all duration-200 ease-out border border-white/40">
              <Play className="w-8 h-8 fill-slate-900 text-slate-900" />
            </div>
            
            <div className="absolute bottom-4 inset-x-4 text-center z-10">
              <span className="inline-block bg-black/60 backdrop-blur-md text-white/90 text-xs px-3 py-1 rounded-full font-medium">
                Cliquer pour voir la démonstration en vidéo
              </span>
            </div>
          </div>
        )
      ) : (
        /* Mode 2: Fallback Local Sécurisé (Preload Metadata pour ne pas saturer Vercel) */
        <video
          src={localSrc}
          poster={poster}
          controls={controls}
          playsInline
          loop={loop}
          muted={muted}
          preload="metadata"
          className="w-full h-full object-cover"
        >
          Votre navigateur ne supporte pas la lecture de vidéo HTML5.
        </video>
      )}
    </div>
  );
}
