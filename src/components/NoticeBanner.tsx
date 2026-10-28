import React from 'react';
import { ShieldCheck, Send, Zap } from 'lucide-react';

interface NoticeBannerProps {
  onHowToDownload: () => void;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ onHowToDownload }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mt-3 mb-1">
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left message */}
        <div className="flex items-center gap-2.5 text-zinc-300 text-center sm:text-left">
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <span className="font-bold text-white">Ultra-Fast Direct G-Drive Links:</span>{' '}
            <span className="text-zinc-400">
              Clean encodes in 480p, 720p HEVC, 1080p &amp; 4K UHD with resume support.
            </span>
          </div>
        </div>

        {/* Right quick pills */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://primehub.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold hover:bg-rose-500/25 transition-colors"
          >
            18+ Zone
          </a>
          <button
            onClick={onHowToDownload}
            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Download Guide
          </button>
        </div>

      </div>
    </div>
  );
};
