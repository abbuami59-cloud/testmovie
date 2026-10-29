import React from 'react';
import { Star, Play, Flame, Clock } from 'lucide-react';
import type { MovieItem } from '../data/cinefreakData.ts';

interface MovieCardProps {
  movie: MovieItem;
  onSelect: (movie: MovieItem) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(movie)}
      className="group flex flex-col cursor-pointer select-none"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#121622] border border-white/[0.08] group-hover:border-amber-400/50 group-hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] transition-all duration-300">
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1 pointer-events-none">
          {/* Rating or Trending */}
          {movie.trending ? (
            <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
              <Flame className="w-2.5 h-2.5 fill-current" />
              HOT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-white/10 shadow">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {movie.rating}
            </span>
          )}

          {/* Quality Badge */}
          {movie.has4k ? (
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
              4K UHD
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
              {movie.formats[0] || 'HD'}
            </span>
          )}
        </div>

        {/* Episode Status Badge */}
        {movie.status && (
          <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
            <span className="bg-black/75 backdrop-blur-md border border-white/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
              {movie.status}
            </span>
          </div>
        )}

        {/* Poster Image */}
        <img
          src={movie.poster}
          alt={movie.cleanName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://image.tmdb.org/t/p/w600_and_h900_bestv2/agNYq5XZnGfmYetUMyyM2RdPY70.jpg';
          }}
        />

        {/* Modern Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
          <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch / Download</span>
          </div>
        </div>

      </div>

      {/* Meta Content */}
      <div className="mt-2.5 px-0.5">
        <h4 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
          {movie.cleanName}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
          <span className="truncate max-w-[110px]">{movie.language.split(' ')[0]}</span>
          <span className="flex items-center gap-1 text-zinc-500 shrink-0">
            <Clock className="w-3 h-3" />
            <span>{movie.timeAgo}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
