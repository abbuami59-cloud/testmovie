import React from 'react';
import { X, CheckCircle, Download, Play, ShieldAlert } from 'lucide-react';

interface HowToDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToDownloadModal: React.FC<HowToDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#141822] border border-white/10 rounded-2xl shadow-2xl p-6 text-[#eaeaea]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">How to Download on CineFreak</h3>
            <p className="text-xs text-zinc-400">Simple 3-step guide for fast downloads</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 my-5 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-[#ff9800] text-black font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <b className="text-white block">Select Your Movie or Series</b>
              <p className="text-xs text-zinc-400 mt-0.5">
                Click on any movie poster from the Latest Releases or use the search bar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-[#ff9800] text-black font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <b className="text-white block">Pick Your Desired Resolution</b>
              <p className="text-xs text-zinc-400 mt-0.5">
                Choose between 480p, 720p HEVC, 1080p Full HD, or 4K UHD with English &amp; Bangla audio/subtitles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="w-6 h-6 rounded-full bg-[#ff9800] text-black font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <b className="text-white block">Direct Download or Watch Online</b>
              <p className="text-xs text-zinc-400 mt-0.5">
                Click <span className="text-emerald-400 font-bold">Download Links</span> for high-speed Google Drive files or <span className="text-amber-300 font-bold">Watch Online</span> for buffer-free streaming!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#ff9800] to-[#ffa726] text-black hover:brightness-110 shadow-lg cursor-pointer"
        >
          Got it! Start Browsing
        </button>
      </div>
    </div>
  );
};
