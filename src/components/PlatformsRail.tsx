import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import type { OttPlatform } from '../data/cinefreakData.ts';

interface PlatformsRailProps {
  platforms: OttPlatform[];
  selectedPlatform: string | null;
  onSelectPlatform: (platform: string | null) => void;
}

export const PlatformsRail: React.FC<PlatformsRailProps> = ({
  platforms,
  selectedPlatform,
  onSelectPlatform,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Streaming Platforms
          </span>
          {selectedPlatform && (
            <button
              onClick={() => onSelectPlatform(null)}
              className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full hover:bg-amber-400/20 transition-colors"
            >
              {selectedPlatform} ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(-1)}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1"
      >
        {platforms.map((p) => {
          const isSelected = selectedPlatform === p.name;
          return (
            <button
              key={p.name}
              onClick={() => onSelectPlatform(isSelected ? null : p.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white/15 border-amber-400 text-white shadow-md shadow-amber-400/10 scale-[1.02]'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  backgroundColor: `${p.brandColor}25`,
                  color: p.brandColor,
                  border: `1px solid ${p.brandColor}50`,
                }}
              >
                {p.mark.slice(0, 2)}
              </span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
