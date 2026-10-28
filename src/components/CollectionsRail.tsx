import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import type { MovieCollection } from '../data/cinefreakData.ts';

interface CollectionsRailProps {
  collections: MovieCollection[];
  selectedCollection: string | null;
  onSelectCollection: (name: string | null) => void;
}

export const CollectionsRail: React.FC<CollectionsRailProps> = ({
  collections,
  selectedCollection,
  onSelectCollection,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 280, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Movie Franchises &amp; Universes
          </h3>
          {selectedCollection && (
            <button
              onClick={() => onSelectCollection(null)}
              className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full hover:bg-amber-400/20 transition-colors"
            >
              {selectedCollection} ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll(-1)}
            className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
      >
        {collections.map((c) => {
          const isSelected = selectedCollection === c.name;
          return (
            <button
              key={c.name}
              onClick={() => onSelectCollection(isSelected ? null : c.name)}
              className={`relative flex flex-col justify-end w-[200px] sm:w-[220px] h-[110px] rounded-2xl overflow-hidden shrink-0 text-left transition-all group cursor-pointer border ${
                isSelected
                  ? 'border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <img
                src={c.img}
                alt={c.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <span
                className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black/60 text-white border border-white/10 backdrop-blur-sm"
              >
                {c.count}
              </span>

              <div className="relative z-10 p-3">
                <span className="block text-white text-xs sm:text-sm font-bold leading-tight drop-shadow line-clamp-1">
                  {c.name}
                </span>
                <span className="block text-zinc-400 text-[10px] mt-0.5">
                  {c.years}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
