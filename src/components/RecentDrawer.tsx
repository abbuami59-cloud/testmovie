import React, { useState } from 'react';
import { X, Clock, Sparkles } from 'lucide-react';
import type { RecentItem, MovieItem } from '../data/cinefreakData.ts';
import { filterRecentItems } from '../utils/movieFilter.ts';

interface RecentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: RecentItem[];
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
}

export const RecentDrawer: React.FC<RecentDrawerProps> = ({
  isOpen,
  onClose,
  items,
  movies,
  onSelectMovie,
}) => {
  const [filter, setFilter] = useState<'all' | 'Movie' | 'Series' | 'ep'>('all');

  if (!isOpen) return null;

  const filteredItems = filterRecentItems(items, filter);

  const handleItemClick = (item: RecentItem) => {
    const found = movies.find(
      (m) =>
        m.title.toLowerCase().includes(item.title.toLowerCase()) ||
        item.title.toLowerCase().includes(m.cleanName.toLowerCase())
    );
    if (found) {
      onSelectMovie(found);
    } else {
      onSelectMovie({
        id: `recent-${item.id}`,
        title: `${item.title} - ${item.sub}`,
        cleanName: item.title,
        poster: item.poster,
        timeAgo: 'Just now',
        trending: true,
        formats: [item.type, 'Dual Audio'],
        status: item.tag,
        has4k: item.sub.includes('4K') || item.sub.includes('2160p'),
        type: item.type,
        rating: '7.9',
        genres: ['Action', 'Thriller', 'Drama'],
        releaseDate: '2026',
        runtime: item.type === 'Series' ? '45 Min / Ep' : '2 Hours 10 Min',
        country: 'India',
        language: item.sub || 'Hindi & English',
        subtitle: 'English SRT Included',
        quality: '480p | 720p | 1080p [WEB-DL]',
        videoFormat: 'MKV (x264 / x265 HEVC)',
        synopsis: `Download and watch ${item.title} (${item.sub}) in high quality exclusively on CineFreak.`,
        screenshots: [],
        downloads: [
          { quality: '480p WEB-DL', size: '450 MB', dlLink: '#', watchLink: '#' },
          { quality: '720p HEVC', size: '920 MB', dlLink: '#', watchLink: '#' },
          { quality: '1080p Full HD', size: '2.1 GB', dlLink: '#', watchLink: '#' },
        ],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside className="relative w-full max-w-md h-full bg-[#0c101c] text-[#eaeaea] border-l border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">Last 24 Hours</h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                {filteredItems.length} fresh releases added
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-3 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'Movie', label: 'Movies' },
              { key: 'Series', label: 'Series' },
              { key: 'ep', label: 'New Episodes' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                filter === tab.key
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredItems.map((item) => {
            const isNew = item.k === 'new';
            const isEp = item.k === 'ep';

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group flex gap-3 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer"
              >
                <img
                  src={item.poster}
                  alt={item.title}
                  loading="lazy"
                  className="w-14 h-20 rounded-xl object-cover bg-zinc-900 shrink-0 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://image.tmdb.org/t/p/w600_and_h900_bestv2/agNYq5XZnGfmYetUMyyM2RdPY70.jpg';
                  }}
                />

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isNew
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isEp
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {item.tag}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {item.type}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </aside>
    </div>
  );
};
