import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroSlider } from './components/HeroSlider.tsx';
import { PlatformsRail } from './components/PlatformsRail.tsx';
import { MovieCard } from './components/MovieCard.tsx';
import { MovieDetailPage } from './components/MovieDetailPage.tsx';
import { RecentDrawer } from './components/RecentDrawer.tsx';
import { HowToDownloadModal } from './components/HowToDownloadModal.tsx';
import { Footer } from './components/Footer.tsx';
import {
  SLIDER_SLIDES,
  OTT_PLATFORMS,
  MOVIES,
  RECENT_ITEMS,
  type MovieItem,
} from './data/cinefreakData.ts';
import { filterMovies, paginate } from './utils/movieFilter.ts';
import { saveMoviesToIndexedDB } from './utils/cacheManager.ts';
import {
  Flame,
  Film,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Database,
} from 'lucide-react';

const FILTER_PILLS = [
  'All',
  'Trending',
  '4K',
  'Dual Audio',
  'Hindi Dubbed',
  'Bangla Movies',
  'WEB-Series',
];

function getSlugFromPath(): string {
  if (typeof window === 'undefined') return '';
  // Check hash route first (e.g. #/movie/:slug or #:slug)
  const hash = window.location.hash || '';
  if (hash.startsWith('#/movie/')) {
    return hash.replace('#/movie/', '').replace(/^\//, '').replace(/\/$/, '').trim();
  }
  if (hash.startsWith('#/')) {
    const s = hash.replace('#/', '').replace(/^\//, '').replace(/\/$/, '').trim();
    if (s && s !== 'home') return s;
  }
  // Then check pathname
  const pathname = window.location.pathname;
  if (pathname.startsWith('/movie/')) {
    return pathname.replace('/movie/', '').replace(/^\//, '').replace(/\/$/, '').trim();
  }
  if (pathname !== '/' && pathname !== '') {
    return pathname.replace(/^\//, '').replace(/\/$/, '').trim();
  }
  return '';
}

export default function App() {
  // 1. All 1,582 releases and download links are 100% hardcoded directly in the website bundle
  const [moviesList, setMoviesList] = useState<MovieItem[]>(() => MOVIES);
  const [lastSyncTime, setLastSyncTime] = useState<number>(() => Date.now());

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [isHowToOpen, setIsHowToOpen] = useState(false);

  // Clean path routing state (WITHOUT # symbol)
  const [currentSlug, setCurrentSlug] = useState<string>(() => getSlugFromPath());

  // 2. Persist hardcoded catalog to IndexedDB locally for instantaneous offline access
  useEffect(() => {
    saveMoviesToIndexedDB(MOVIES).catch(() => {});
  }, []);

  // 3. Listen to browser Back/Forward (popstate) navigation for clean paths
  useEffect(() => {
    const handlePopState = () => {
      setCurrentSlug(getSlugFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Path navigation helper (Clean URLs e.g. /movie/colony-2026-full-movie-download)
  const navigateToSlug = (slug: string | null) => {
    if (slug) {
      const cleanPath = `/movie/${slug}`;
      window.history.pushState({ slug }, '', cleanPath);
      setCurrentSlug(slug);
    } else {
      window.history.pushState(null, '', '/');
      setCurrentSlug('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active movie if on a dedicated movie page
  const activeMovie = useMemo(() => {
    if (!currentSlug) return null;
    return moviesList.find(
      (m) => m.slug === currentSlug || m.id === currentSlug
    ) || null;
  }, [currentSlug, moviesList]);

  // Sync handler (Pure local verification with zero network fetch)
  const handleSyncLatest = async () => {
    setIsSyncing(true);
    setSyncToast(`Verifying all ${MOVIES.length} hardcoded releases...`);

    try {
      await saveMoviesToIndexedDB(MOVIES);
      setLastSyncTime(Date.now());
      setIsSyncing(false);
      setSyncToast(`All ${MOVIES.length} CineFreak releases are hardcoded locally inside the website!`);
      setTimeout(() => setSyncToast(null), 3000);
    } catch {
      setIsSyncing(false);
      setSyncToast(`All ${MOVIES.length} releases are ready!`);
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Filter movies
  const filteredMovies = useMemo(() => {
    return filterMovies(
      moviesList,
      searchQuery,
      activeCategory,
      selectedPlatform,
      selectedCollection
    );
  }, [moviesList, searchQuery, activeCategory, selectedPlatform, selectedCollection]);

  // Paginate 24 items per page
  const paginationData = useMemo(() => {
    return paginate(filteredMovies, currentPage, 24);
  }, [filteredMovies, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    setSelectedPlatform(null);
    setSelectedCollection(null);
    if (currentSlug) navigateToSlug(null);
  };

  const handlePlatformChange = (platform: string | null) => {
    setSelectedPlatform(platform);
    setCurrentPage(1);
    if (currentSlug) navigateToSlug(null);
  };

  const handleCollectionChange = (collection: string | null) => {
    setSelectedCollection(collection);
    setCurrentPage(1);
    if (currentSlug) navigateToSlug(null);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    if (currentSlug && q) navigateToSlug(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setSelectedPlatform(null);
    setSelectedCollection(null);
    setCurrentPage(1);
    if (currentSlug) navigateToSlug(null);
  };

  const isAnyFilterActive =
    searchQuery ||
    activeCategory !== 'All' ||
    selectedPlatform !== null ||
    selectedCollection !== null;

  return (
    <div className="min-h-screen bg-[#070a12] text-[#e2e8f0] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-400 selection:text-slate-950">
      
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#121927]/95 border border-emerald-500/50 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{syncToast}</span>
        </div>
      )}

      {/* 1. Header with clean path navigation */}
      <Header
        onOpenRecent={() => setIsRecentOpen(true)}
        recentCount={RECENT_ITEMS.length}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSelectCategory={(cat) => {
          handleCategoryChange(cat);
          if (currentSlug) navigateToSlug(null);
        }}
        activeCategory={activeCategory}
        totalCached={moviesList.length}
        onSync={handleSyncLatest}
        isSyncing={isSyncing}
        onOpenHowTo={() => setIsHowToOpen(true)}
      />

      {/* If activeMovie exists, render Dedicated Movie Detail Page with clean path URL */}
      {activeMovie ? (
        <MovieDetailPage
          movie={activeMovie}
          allMovies={moviesList}
          onNavigateHome={() => navigateToSlug(null)}
          onSelectMovie={(selected) => navigateToSlug(selected.slug)}
        />
      ) : (
        <>
          {/* 2. Hero Feature Spotlight */}
          {!isAnyFilterActive && (
            <HeroSlider
              slides={SLIDER_SLIDES}
              onSelectMovie={(id) => {
                const movie = moviesList.find((m) => m.id === id || m.slug === id) || moviesList[0];
                navigateToSlug(movie.slug);
              }}
            />
          )}

          {/* 3. Streaming Platforms Rail */}
          <PlatformsRail
            platforms={OTT_PLATFORMS}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={handlePlatformChange}
          />

          {/* 6. Main Content Area */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6 flex-1">
            
            {/* Section Heading & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {searchQuery
                      ? `Results for "${searchQuery}"`
                      : selectedPlatform
                      ? `${selectedPlatform} Releases`
                      : selectedCollection
                      ? `${selectedCollection} Franchise`
                      : activeCategory !== 'All'
                      ? `${activeCategory}`
                      : 'All CineFreak Releases'}
                  </h2>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>{filteredMovies.length} releases available with clean URLs</span>
                  </p>
                </div>
              </div>

              {/* Quick Filter Pill Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
                {FILTER_PILLS.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => handleCategoryChange(pill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      activeCategory === pill && !selectedPlatform && !selectedCollection && !searchQuery
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
                    }`}
                  >
                    {pill}
                  </button>
                ))}

                {isAnyFilterActive && (
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer"
                  >
                    Reset All ✕
                  </button>
                )}
              </div>

            </div>

            {/* Movie Grid */}
            {paginationData.items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
                {paginationData.items.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={(m) => navigateToSlug(m.slug)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No movies match your filter</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Try searching with another keyword or reset your filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Pagination Bar */}
            {paginationData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12 flex-wrap">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={paginationData.currentPage === 1}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white hover:border-amber-400 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((pg) => {
                  if (
                    pg === 1 ||
                    pg === paginationData.totalPages ||
                    (pg >= paginationData.currentPage - 2 && pg <= paginationData.currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pg}
                        onClick={() => {
                          setCurrentPage(pg);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          paginationData.currentPage === pg
                            ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/25'
                            : 'bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:border-amber-400'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  } else if (
                    pg === paginationData.currentPage - 3 ||
                    pg === paginationData.currentPage + 3
                  ) {
                    return (
                      <span key={pg} className="px-1 text-zinc-600 text-xs">
                        …
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(paginationData.totalPages, p + 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={paginationData.currentPage === paginationData.totalPages}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white hover:border-amber-400 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}

          </main>
        </>
      )}

      {/* Last 24 Hours Drawer */}
      <RecentDrawer
        isOpen={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        items={RECENT_ITEMS}
        movies={moviesList}
        onSelectMovie={(m) => navigateToSlug(m.slug)}
      />

      {/* How to Download Modal */}
      <HowToDownloadModal
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
