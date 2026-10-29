import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Download,
  Play,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Share2,
  Calendar,
  Globe,
  Clock,
  Film,
  HardDrive,
  Check,
  Search,
  Tv,
  Youtube,
  RefreshCw,
} from 'lucide-react';
import type { MovieItem, EpisodeItem } from '../data/cinefreakData.ts';
import { MovieCard } from './MovieCard.tsx';

interface MovieDetailPageProps {
  movie: MovieItem;
  allMovies: MovieItem[];
  onNavigateHome: () => void;
  onSelectMovie: (movie: MovieItem) => void;
}

export const MovieDetailPage: React.FC<MovieDetailPageProps> = ({
  movie,
  allMovies,
  onNavigateHome,
  onSelectMovie,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [enlargedScreenshot, setEnlargedScreenshot] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePlayerTab, setActivePlayerTab] = useState<'watch' | 'trailer'>('watch');
  const [isPlayingStream, setIsPlayingStream] = useState(false);
  const [epSearch, setEpSearch] = useState('');
  const [liveDownloads, setLiveDownloads] = useState(movie.downloads);
  const [liveEpisodes, setLiveEpisodes] = useState(movie.episodes || []);
  const [liveScreenshots, setLiveScreenshots] = useState(movie.screenshots || []);
  const [isFetchingLive, setIsFetchingLive] = useState(false);

  // Hardcoded direct links & state on page load (zero external fetch needed)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsPlayingStream(false);
    setLiveDownloads(movie.downloads || []);
    setLiveEpisodes(movie.episodes || []);
    setLiveScreenshots(movie.screenshots || []);
  }, [movie]);

  const movieShareUrl = `${window.location.origin}/movie/${movie.slug}`;

  // Instant local link confirmation (all links are 100% hardcoded inside the website)
  const handleVerifyLinks = () => {
    const totalCount = liveDownloads.length || liveEpisodes.length;
    setToastMessage(`All ${totalCount} direct CineCloud download & watch links are hardcoded inside the website!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText(movieShareUrl);
    setToastMessage(`Copied clean page link: ${movieShareUrl}`);
    setTimeout(() => setCopiedLink(false), 2000);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter episodes if web series
  const filteredEpisodes = useMemo(() => {
    if (!liveEpisodes) return [];
    if (!epSearch.trim()) return liveEpisodes;
    return liveEpisodes.filter((ep) =>
      ep.epName.toLowerCase().includes(epSearch.toLowerCase())
    );
  }, [liveEpisodes, epSearch]);

  // Find related releases
  const relatedMovies = allMovies
    .filter((m) => m.slug !== movie.slug && m.type === movie.type)
    .slice(0, 12);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6 font-['Poppins',sans-serif] text-[#e5e7eb]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#121927]/95 border border-amber-400/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. BREADCRUMB BAR (Exact CineFreak style) */}
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-zinc-200 hover:text-amber-400 font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 font-medium">{movie.formats[0] || 'Movies'}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-cyan-400 font-semibold truncate max-w-[200px] sm:max-w-md">
            {movie.cleanName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyLinks}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
            title="All direct download links are hardcoded inside the website"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Native Links</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Share Page</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. POSTER & TITLE GRID SECTION (Exact CineFreak content-grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left: Poster Box */}
        <div className="md:col-span-4 lg:col-span-3 mx-auto md:mx-0 w-48 sm:w-56 md:w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 shrink-0">
          <img
            src={movie.poster}
            alt={`${movie.cleanName} Poster`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://image.tmdb.org/t/p/w600_and_h900_bestv2/agNYq5XZnGfmYetUMyyM2RdPY70.jpg';
            }}
          />
        </div>

        {/* Right: Full Title & Category Badges */}
        <div className="md:col-span-8 lg:col-span-9 space-y-4">
          
          {/* Main Title (Exact CineFreak page-title format) */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug tracking-tight">
            {movie.title}
          </h1>

          {/* Category Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {movie.formats.map((fmt, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.06] text-zinc-200 border border-white/15"
              >
                {fmt}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.06] text-cyan-300 border border-cyan-400/30 border-dashed">
              {movie.type === 'Series' ? 'WEB-Series' : 'Full Movie'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white border border-blue-500 shadow-sm">
              Disney+ Hotstar
            </span>
          </div>

          {/* Quick Details Table (CineFreak Post Details Table) */}
          <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
              <div>
                <strong className="text-cyan-400">⭐ IMDb Rating:</strong>{' '}
                <span className="text-amber-300 font-bold">{movie.rating}/10</span>
              </div>
              <div>
                <strong className="text-cyan-400">📅 Release Date:</strong>{' '}
                <span>{movie.releaseDate}</span>
              </div>
              <div>
                <strong className="text-cyan-400">⏱️ Runtime:</strong>{' '}
                <span>{movie.runtime}</span>
              </div>
              <div>
                <strong className="text-cyan-400">🔊 Language:</strong>{' '}
                <span>{movie.language}</span>
              </div>
              <div>
                <strong className="text-cyan-400">💬 Subtitles:</strong>{' '}
                <span>{movie.subtitle}</span>
              </div>
              <div>
                <strong className="text-cyan-400">🎞️ Quality:</strong>{' '}
                <span>{movie.quality}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <strong className="text-cyan-400">🎬 Official Trailer:</strong>
              <button
                onClick={() => setActivePlayerTab('trailer')}
                className="text-amber-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>Watch on YouTube</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 3. IN-PAGE VIDEO PLAYER CONTAINER (100% Exact CineFreak .cf-player-wrapper) */}
      <div className="my-6 border-2 border-amber-400/50 rounded-2xl overflow-hidden bg-[#090a0f] shadow-[0_0_24px_rgba(251,191,36,0.2)]">
        
        {/* Player Tabs Bar */}
        <div className="flex items-center gap-2 p-3 bg-[#0f1117] border-b border-white/[0.08]">
          <button
            onClick={() => setActivePlayerTab('watch')}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePlayerTab === 'watch'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-[#161922] text-zinc-300 hover:text-white border border-white/10'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Online</span>
          </button>

          <button
            onClick={() => setActivePlayerTab('trailer')}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePlayerTab === 'trailer'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-[#161922] text-zinc-300 hover:text-white border border-white/10'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>Official Trailer</span>
          </button>
        </div>

        {/* Player Screenholder Aspect 16:9 */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {activePlayerTab === 'trailer' ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/LW6dpj1uCK8?autoplay=1&rel=0"
              title="Official Trailer"
              allow="autoplay; encrypted-media; fullscreen"
              className="w-full h-full border-0"
            />
          ) : isPlayingStream ? (
            <iframe
              src={liveDownloads[0]?.watchLink || `https://cinefreak.net/${movie.slug}/`}
              title={movie.cleanName}
              allow="autoplay; encrypted-media; fullscreen"
              className="w-full h-full border-0"
            />
          ) : (
            <div
              onClick={() => setIsPlayingStream(true)}
              className="absolute inset-0 w-full h-full cursor-pointer group bg-center bg-cover flex flex-col items-center justify-center gap-3 text-white"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(9,10,15,0.4) 0%, rgba(9,10,15,0.85) 100%), url(${movie.poster})`,
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-[0_0_0_10px_rgba(251,191,36,0.2)] group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              </div>
              <span className="text-sm sm:text-base font-bold drop-shadow-md">
                Click to Stream {movie.cleanName} Online
              </span>
            </div>
          )}
        </div>

      </div>

      {/* 4. PLOT SUMMARY / STORYLINE BOX (100% CineFreak #00ffff Cyan Header Box) */}
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
        <h3 className="text-lg font-bold text-[#00ffff] flex items-center gap-2">
          <span>📖 Plot Summary / Storyline:</span>
        </h3>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
          {movie.synopsis}
        </p>
      </div>

      {/* 5. SCREENSHOTS SECTION (100% CineFreak #00ffff Cyan Header & Grid with exact cineimg.xyz images) */}
      {liveScreenshots && liveScreenshots.length > 0 && (
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-lg font-bold text-[#00ffff] flex items-center gap-2">
            <span>🖼️ Screenshots: (Must See Before Downloading):</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {liveScreenshots.map((sUrl, idx) => (
              <div
                key={idx}
                onClick={() => setEnlargedScreenshot(sUrl)}
                className="relative aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer group bg-zinc-900"
              >
                <img
                  src={sUrl}
                  alt={`${movie.cleanName} Screenshot ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://cineimg.xyz/images/11b167fff50946523eba1bba925bfd8f.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-bold text-white bg-black/70 px-3 py-1 rounded-lg backdrop-blur-sm">
                    Enlarge 🔍
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. STREAMING & DOWNLOAD LINKS SECTION (100% Native HTML <a> tags with exact CineCloud URLs) */}
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-6">
        
        <h3 className="text-xl font-bold text-[#00ffff] text-center">
          Streaming &amp; Download Links:
        </h3>

        <p className="text-xs sm:text-sm text-zinc-300 text-center max-w-xl mx-auto leading-relaxed">
          Enjoy buffer-free <strong className="text-white">streaming</strong> or download{' '}
          <strong className="text-amber-300">{movie.cleanName}</strong> in high quality. Our servers like G-Drive and Direct Links ensure the best experience for CineFreak users.
        </p>

        {/* Section title & Gradient HR line with ▼ icon (Exact CineFreak HR) */}
        <div className="text-center relative my-6">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#00ffff] to-transparent w-full my-4" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0e121e] px-3 text-[#00ffff] text-sm font-bold">
            ▼ Download Links ▼
          </span>
        </div>

        {/* IF WEB SERIES / HAS EPISODES: Render CineFreak Episode List */}
        {liveEpisodes && liveEpisodes.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <span className="text-sm font-bold text-amber-300">
                Single Episodes ({liveEpisodes.length} Episodes Available)
              </span>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={epSearch}
                  onChange={(e) => setEpSearch(e.target.value)}
                  placeholder="Search episode (e.g. 120, 119)..."
                  className="w-full bg-[#161922] border border-white/10 rounded-xl pl-9 pr-3 py-1 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredEpisodes.map((ep, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#161922] border border-white/5 hover:border-amber-400/40 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{ep.epName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                      WEB-DL
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                    {ep.watchLink && (
                      <a
                        href={ep.watchLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#ffd700]/15 border border-[#ffd700]/70 text-[#fff7c0] font-bold text-xs hover:scale-105 transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch</span>
                      </a>
                    )}
                    {ep.dlLinks.map((dl, dIdx) => (
                      <a
                        key={dIdx}
                        href={dl.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[rgba(25,36,43,0.9)] border border-white/25 text-white font-bold text-xs hover:scale-105 transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
                        <span>{dl.quality}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MOVIE DOWNLOAD CARDS (Exact CineFreak .dlbtn-container format with NATIVE <a> links) */
          <div className="space-y-6">
            {liveDownloads.map((dl, idx) => (
              <div key={idx} className="text-center space-y-3 p-4 rounded-xl bg-[#131826] border border-white/10">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {dl.quality || `${movie.cleanName} (${movie.releaseDate})`}
                </h4>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {/* REAL NATIVE <a href> DOWNLOAD LINK */}
                  <a
                    href={dl.dlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dlbtn dlbtn-download inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/25 bg-[rgba(25,36,43,0.9)] hover:scale-105 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Links</span>
                  </a>

                  {/* REAL NATIVE <a href> WATCH ONLINE LINK */}
                  <a
                    href={dl.watchLink || dl.dlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dlbtn dlbtn-watch inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ffd700]/70 bg-[#ffd700]/12 text-[#fff7c0] hover:scale-105 active:scale-95 font-bold text-xs sm:text-sm shadow-[inset_0_0_10px_rgba(255,215,0,0.3)] transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Online</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 7. MORE RELATED RELEASES */}
      {relatedMovies.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-bold text-[#00ffff]">More Related Releases</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
            {relatedMovies.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                onSelect={(selected) => onSelectMovie(selected)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enlarged Screenshot Modal */}
      {enlargedScreenshot && (
        <div
          onClick={() => setEnlargedScreenshot(null)}
          className="fixed inset-0 z-60 bg-black/90 p-4 flex items-center justify-center cursor-pointer animate-in fade-in"
        >
          <img
            src={enlargedScreenshot}
            alt="Enlarged screenshot"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
