import React from 'react';
import { Film, Shield, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070a12] py-12 mt-20 text-zinc-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5">
              <div className="w-full h-full bg-[#070a12] rounded-[10px] flex items-center justify-center">
                <Film className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-white text-base">CineFreak</span>
              <span className="text-zinc-500 text-xs ml-2">Fast Streaming &amp; Downloads</span>
            </div>
          </div>

          {/* Connect links */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:contact@cinefreak.net"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white font-semibold transition-colors"
            >
              <span>contact@cinefreak.net</span>
            </a>
          </div>
        </div>

        {/* Disclaimer & note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs text-zinc-500 leading-relaxed">
          <p>
            <strong className="text-zinc-400">Disclaimer:</strong> CineFreak is a media indexer and does not host any video files on its web servers. All content links are indexed from third-party publicly available cloud drives and networks.
          </p>
          <p className="md:text-right">
            © 2026 CineFreak. All rights reserved. Optimized for high-speed streaming &amp; offline playback.
          </p>
        </div>

      </div>
    </footer>
  );
};
