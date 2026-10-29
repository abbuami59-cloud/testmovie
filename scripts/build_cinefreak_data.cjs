const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../public/cinefreak_catalog.json');
const targetPath = path.resolve(__dirname, '../src/data/cinefreakData.ts');

const fullCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Hardcode ALL 1,582 items directly inside the bundle so zero fetch is required
const allMovies = fullCatalog;

const tsContent = `export interface EpisodeItem {
  epName: string;
  watchLink?: string;
  dlLinks: { quality: string; href: string }[];
}

export interface MovieDownloadLink {
  quality: string;
  size: string;
  dlLink: string;
  watchLink?: string;
}

export interface MovieItem {
  id: string;
  slug: string;
  title: string;
  cleanName: string;
  poster: string;
  timeAgo: string;
  trending: boolean;
  formats: string[];
  status: string;
  has4k: boolean;
  type: string;
  rating: string;
  genres: string[];
  releaseDate: string;
  runtime: string;
  country: string;
  language: string;
  subtitle: string;
  quality: string;
  videoFormat: string;
  synopsis: string;
  screenshots: string[];
  downloads: MovieDownloadLink[];
  episodes?: EpisodeItem[];
  publishedTime?: number | null;
  publishedTimeStr?: string | null;
}

export interface RecentItem {
  id: string;
  title: string;
  type: 'Movie' | 'Series';
  sub: string;
  poster: string;
  tag: string;
  k: 'new' | 'ep' | 'other';
}

export interface OttPlatform {
  name: string;
  brandColor: string;
  mark: string;
  tag?: string;
}

export interface MovieCollection {
  name: string;
  img: string;
  alt: string;
  count: string | number;
  years: string;
  slug?: string;
  description?: string;
}

export interface SliderSlide {
  id: string;
  movieId: string;
  title: string;
  img: string;
  alt: string;
  tagFeat: string;
  tagCat: string;
}

export const OTT_PLATFORMS: OttPlatform[] = [
  { name: 'Netflix', brandColor: '#E50914', mark: 'NF', tag: 'netflix' },
  { name: 'Disney+ Hotstar', brandColor: '#14805E', mark: 'DS', tag: 'hotstar' },
  { name: 'Prime Video', brandColor: '#00A8E1', mark: 'PV', tag: 'prime' },
  { name: 'Hoichoi', brandColor: '#EE2A24', mark: 'HC', tag: 'hoichoi' },
  { name: 'ZEE5', brandColor: '#A020F0', mark: 'Z5', tag: 'zee5' },
  { name: 'Chorki', brandColor: '#FF4500', mark: 'CK', tag: 'chorki' },
  { name: 'SonyLIV', brandColor: '#0055FF', mark: 'SL', tag: 'sonyliv' },
  { name: 'Apple TV+', brandColor: '#A2AAAD', mark: 'AT', tag: 'apple' },
];

export const COLLECTIONS: MovieCollection[] = [
  {
    name: 'Marvel Cinematic Universe (MCU)',
    count: '36 Movies',
    years: '2008 - 2026',
    img: 'https://image.tmdb.org/t/p/w1280/mDfGcvTOLK6w6S0unD02ez92i52.jpg',
    alt: 'Marvel Cinematic Universe',
    slug: 'mcu',
    description: 'Explore the entire Marvel Cinematic Universe in stunning 4K and 1080p HEVC.',
  },
  {
    name: 'Bengali Original Series & Movies',
    count: '120 Titles',
    years: '2019 - 2026',
    img: 'https://cineimg.xyz/images/140467a6166b1cff2d099cd43902fc3b.webp',
    alt: 'Bengali Original Series',
    slug: 'bengali-original',
    description: 'Top-rated Hoichoi, Chorki, and Bangladeshi web series and drama.',
  },
  {
    name: 'Spider-Man Universe',
    count: '11 Movies',
    years: '2002 - 2026',
    img: 'https://image.tmdb.org/t/p/w1280/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    alt: 'Spider-Man Universe',
    slug: 'spider-man',
    description: 'Every Spider-Man movie from Tobey Maguire to Spider-Verse.',
  },
  {
    name: 'Anime Series & Films',
    count: '85 Series',
    years: '1996 - 2026',
    img: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    alt: 'Anime Series & Films',
    slug: 'anime',
    description: 'Full season batches of Bleach, Naruto, Fullmetal Alchemist and more with English subs.',
  },
];

export const SLIDER_SLIDES: SliderSlide[] = [
  {
    id: 'slide-colony',
    movieId: 'cf-1',
    title: 'Colony (2026)',
    img: 'https://image.tmdb.org/t/p/original/wC69brhk65GvrgNQdqLRUqtneUH.jpg',
    alt: 'Colony (2026) Dual Audio Movie Download',
    tagFeat: 'Featured',
    tagCat: 'Sci-Fi Action',
  },
  {
    id: 'slide-lupin',
    movieId: 'cf-lupin-2026-part-4-full-series-download',
    title: 'Lupin (Season 4)',
    img: 'https://image.tmdb.org/t/p/original/5ooWESpcGhoLnSQA2MaSvIAFmdm.jpg',
    alt: 'Lupin Part 4 Download',
    tagFeat: 'Trending',
    tagCat: 'Netflix Original',
  },
  {
    id: 'slide-baththa',
    movieId: 'cf-baththa-2026-full-movie-download',
    title: 'Baththa (2026)',
    img: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/7wHBYs8HHmTGe4nXLpMEAoDSK2o.jpg',
    alt: 'Baththa (2026) Movie Download',
    tagFeat: 'Exclusive',
    tagCat: 'Dual Audio Action',
  },
  {
    id: 'slide-birangana',
    movieId: 'cf-6',
    title: 'Birangana (Season 2)',
    img: 'https://cineimg.xyz/images/140467a6166b1cff2d099cd43902fc3b.webp',
    alt: 'Birangana Season 2 Bengali Series',
    tagFeat: 'Hoichoi',
    tagCat: 'Bengali Series',
  },
];

export const RECENT_ITEMS: RecentItem[] = ${JSON.stringify(
  allMovies.slice(0, 30).map((m, idx) => ({
    id: `rec-${idx + 1}`,
    title: m.cleanName,
    type: m.type === 'Series' ? 'Series' : 'Movie',
    sub: m.quality || '1080p | 720p',
    poster: m.poster,
    tag: m.formats?.[0] || 'WEB-DL',
    k: m.type === 'Series' ? 'ep' : 'new',
  })),
  null,
  2
)};

export const MOVIES: MovieItem[] = ${JSON.stringify(allMovies, null, 2)};
`;

fs.writeFileSync(targetPath, tsContent, 'utf8');
console.log('Successfully generated src/data/cinefreakData.ts');
