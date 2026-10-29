import React, { useState } from 'react';
import { Search, Clock, Film, Tv, X, Menu, Flame, Shield, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenRecent: () => void;
  recentCount: number;
  onSearch: (q: string) => void;
  searchQuery: string;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
  totalCached: number;
  onSync: () => void;
  isSyncing: boolean;
  onOpenHowTo: () => void;
}

const NAV_ITEMS = [
  { id: 'All', label: 'All Releases', icon: Layers },
  { id: 'Trending', label: 'Trending', icon: Flame },
  { id: '4K', label: '4K Ultra HD', icon: Tv },
  { id: 'WEB-Series', label: 'Series', icon: Film },
  { id: 'Bangla Movies', label: 'Bangla' },
  { id: 'Hindi Dubbed', label: 'Hindi Dubbed' },
  { id: 'Dual Audio', label: 'Dual Audio' },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenRecent,
  recentCount,
  onSearch,
  searchQuery,
  onSelectCategory,
  activeCategory,
  totalCached,
  onSync,
  isSyncing,
  onOpenHowTo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                onSelectCategory('All');
                onSearch('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                  <Film className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white font-['Poppins']">
                    Cine<span className="text-amber-400">Freak</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide hidden sm:block">
                  Stream &amp; Direct Downloads
                </p>
              </div>
            </button>
          </div>

          {/* Center: Search Bar with quick clear */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search 185+ movies, series, 4K, languages..."
                className="w-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-[#121926] border border-white/10 focus:border-amber-400/60 rounded-xl pl-10 pr-9 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none transition-all shadow-inner"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            
            {/* Cache & Sync Pill */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 transition-colors"
              title="Click to refresh browser cache"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-zinc-200">{totalCached} Cached</span>
            </button>

            {/* How to download guide in top corner */}
            <button
              onClick={onOpenHowTo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="CineFreak Download Guide"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Guide</span>
            </button>

            {/* Last 24 Hours clock notification */}
            <button
              onClick={onOpenRecent}
              className="relative p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all group"
              title="View Last 24 Hours releases"
              aria-label="Last 24 Hours releases"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 group-hover:text-amber-400 transition-colors" />
              {recentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-md border border-[#090d16]">
                  {recentCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search 185+ movies & series..."
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Horizontal Category Nav Row */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 border-t border-white/[0.06]">
          {NAV_ITEMS.map((item) => {
            const isSelected = activeCategory === item.id && !searchQuery;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectCategory(item.id);
                  if (searchQuery) onSearch('');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onSelectCategory('All');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/5 text-left font-bold text-white hover:bg-white/10"
              >
                🏠 Home
              </button>
              <button
                onClick={() => {
                  onOpenRecent();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/5 text-left font-bold text-white hover:bg-white/10 flex items-center justify-between"
              >
                <span>🕒 Last 24 Hours</span>
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                  {recentCount}
                </span>
              </button>
              <button
                onClick={() => {
                  onOpenHowTo();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/5 text-left font-bold text-white hover:bg-white/10"
              >
                📖 Download Guide
              </button>
              <button
                onClick={() => {
                  onSync();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-white/5 text-left font-bold text-emerald-400 hover:bg-white/10"
              >
                ⚡ Refresh Cache
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
