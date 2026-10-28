import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Play,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Film,
  HardDrive,
  Link as LinkIcon,
} from 'lucide-react';
import type { MovieItem } from '../data/cinefreakData.ts';

interface MovieDetailModalProps {
  movie: MovieItem | null;
  onClose: () => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ movie, onClose }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [enlargedScreenshot, setEnlargedScreenshot] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!movie) return null;

  const movieShareUrl = `${window.location.origin}/#/movie/${movie.slug}`;

  const handleDownload = (dl: { quality: string; size: string; dlLink: string }) => {
    setToastMessage(`Opening direct G-Drive / CineCloud link for ${dl.quality}...`);
    setTimeout(() => {
      window.open(dl.dlLink, '_blank', 'noopener,noreferrer');
    }, 400);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleWatch = (dl: { quality: string; size: string; watchLink: string; dlLink: string }) => {
    const target = dl.watchLink || dl.dlLink;
    setToastMessage(`Launching HD buffer-free streaming player...`);
    setTimeout(() => {
      window.open(target, '_blank', 'noopener,noreferrer');
    }, 400);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText(movieShareUrl);
    setToastMessage(`Copied unique slug URL: /#/movie/${movie.slug}`);
    setTimeout(() => setCopiedLink(false), 2000);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-[#161f30] border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#0c101c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#0c101c]/95 backdrop-blur-md border-b border-white/10 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
              {movie.releaseDate}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {movie.type === 'Series' ? 'Web Series' : 'Movie'}
            </span>
            {/* Slug pill */}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-white/5 truncate max-w-[280px]">
              <LinkIcon className="w-3 h-3 text-amber-400 shrink-0" />
              <span>/{movie.slug}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Copy unique slug URL"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share Slug</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Main Info Row */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            
            {/* Poster */}
            <div className="w-40 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0 mx-auto sm:mx-0 bg-zinc-900">
              <img
                src={movie.poster}
                alt={movie.cleanName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://image.tmdb.org/t/p/w600_and_h900_bestv2/agNYq5XZnGfmYetUMyyM2RdPY70.jpg';
                }}
              />
            </div>

            {/* Title & Details */}
            <div className="flex-1 min-w-0 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {movie.title}
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>IMDb: {movie.rating}/10</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-zinc-200">
                  {movie.runtime}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-zinc-200">
                  {movie.language}
                </span>
                {movie.has4k && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950">
                    4K Ultra HD
                  </span>
                )}
              </div>

              {/* Storyline */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Storyline
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  {movie.synopsis}
                </p>
              </div>

              {/* Tags & Formats */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {movie.formats.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/5"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Download & Streaming Links Section */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>Verified Direct Downloads &amp; Streaming ({movie.downloads.length} Links)</span>
              </h3>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> G-Drive High-Speed Cloud
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {movie.downloads.map((dl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white">{dl.quality}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        {dl.size}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                      Multi-audio • 10bit HEVC / x264 • Direct Link
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(dl)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => handleWatch(dl)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Stream Online</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshots Gallery */}
          {movie.screenshots && movie.screenshots.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-zinc-300 flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Real Video Screenshots ({movie.screenshots.length} Images)</span>
                </h3>
                <span className="text-xs text-zinc-500">Click to zoom</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {movie.screenshots.map((sUrl, idx) => (
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
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                        Enlarge 🔍
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtitles & Sharing Link */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <button
              onClick={() => handleDownload({ quality: 'English & Bangla Subtitles', size: '200 KB', dlLink: `https://new5.cinecloud.site/sub/${movie.slug}.zip` })}
              className="text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Download English &amp; Bangla Subtitles (.SRT)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-zinc-500">
              Shareable slug: <code className="text-zinc-400 bg-white/5 px-1 py-0.5 rounded">/#/movie/{movie.slug}</code>
            </span>
          </div>

        </div>

      </div>

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
