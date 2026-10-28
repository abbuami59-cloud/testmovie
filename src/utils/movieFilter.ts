import type { MovieItem, RecentItem } from '../data/cinefreakData.ts';

export function filterMovies(
  movies: MovieItem[],
  query: string,
  category: string,
  platform: string | null,
  collection: string | null
): MovieItem[] {
  let result = [...movies];

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.cleanName.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q) ||
        m.formats.some((f) => f.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'All') {
    const catLower = category.toLowerCase();
    result = result.filter((m) => {
      if (category === '4K') return m.has4k;
      if (category === 'Trending') return m.trending;
      if (category === 'WEB-Series') return m.type === 'Series';
      return m.formats.some((f) => f.toLowerCase().includes(catLower)) ||
        m.title.toLowerCase().includes(catLower);
    });
  }

  if (platform) {
    const platLower = platform.toLowerCase();
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(platLower) ||
        (platLower.includes('netflix') && m.title.toLowerCase().includes('netflix')) ||
        (platLower.includes('prime') && m.title.toLowerCase().includes('prime')) ||
        (platLower.includes('hotstar') && (m.title.toLowerCase().includes('hotstar') || m.title.toLowerCase().includes('disney'))) ||
        (platLower.includes('hoichoi') && m.title.toLowerCase().includes('hoichoi')) ||
        (platLower.includes('bongo') && m.title.toLowerCase().includes('bongo')) ||
        (platLower.includes('sony') && (m.title.toLowerCase().includes('sony') || m.title.toLowerCase().includes('sonyliv'))) ||
        (platLower.includes('zee5') && m.title.toLowerCase().includes('zee5')) ||
        (platLower.includes('chorki') && m.title.toLowerCase().includes('chorki')) ||
        (platLower.includes('klikk') && m.title.toLowerCase().includes('klikk'))
    );
  }

  if (collection) {
    const collWords = collection.toLowerCase().split(' ').filter(Boolean);
    result = result.filter((m) =>
      collWords.some((w) => m.title.toLowerCase().includes(w))
    );
  }

  return result;
}

export function filterRecentItems(
  items: RecentItem[],
  filter: 'all' | 'Movie' | 'Series' | 'ep'
): RecentItem[] {
  if (filter === 'all') return items;
  if (filter === 'Movie') return items.filter((i) => i.type === 'Movie');
  if (filter === 'Series') return items.filter((i) => i.type === 'Series');
  if (filter === 'ep') return items.filter((i) => i.k === 'ep' || i.tag.toLowerCase().includes('ep'));
  return items;
}

export function paginate<T>(items: T[], page: number, pageSize: number = 18): {
  items: T[];
  totalPages: number;
  currentPage: number;
} {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: pageItems,
    totalPages,
    currentPage: validPage,
  };
}
