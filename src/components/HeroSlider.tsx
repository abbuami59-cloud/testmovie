import React, { useState, useEffect } from 'react';
import { Play, Download, ChevronLeft, ChevronRight, Star, Calendar, Sparkles } from 'lucide-react';
import type { SliderSlide } from '../data/cinefreakData.ts';

interface HeroSliderProps {
  slides: SliderSlide[];
  onSelectMovie: (movieId: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onSelectMovie }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[460px] rounded-3xl overflow-hidden bg-[#0d121f] border border-white/10 shadow-2xl">
        
        {/* Background Backdrop Image */}
        <div className="absolute inset-0">
          <img
            key={current.id}
            src={current.img}
            alt={current.alt}
            className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-all duration-1000 ease-out"
          />
          {/* Multi-layer modern gradient overlays for perfect readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/50 to-transparent" />
        </div>

        {/* Content Inset */}
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end z-20 max-w-2xl">
          
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{current.tagFeat} Spotlight</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/10">
              {current.tagCat}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/10">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>8.2</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md mb-3 line-clamp-2">
            {current.title}
          </h2>

          {/* Subtitle / Details */}
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-6 max-w-lg font-medium drop-shadow leading-relaxed">
            Direct high-speed Google Drive and multi-server downloads available in 480p, 720p, 1080p HEVC, and 4K Ultra HD with dual audio tracks.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onSelectMovie(current.movieId)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Online</span>
            </button>

            <button
              onClick={() => onSelectMovie(current.movieId)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm backdrop-blur-md active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Links</span>
            </button>
          </div>

        </div>

        {/* Navigation Arrows & Indicators */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          {/* Dots */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-5 h-1.5 bg-amber-400'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};
