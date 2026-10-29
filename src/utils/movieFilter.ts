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
    result = result.filter((m) => {
      const title = m.title.toLowerCase();
      const syn = (m.synopsis || '').toLowerCase();
      const formats = (m.formats || []).map((f) => f.toLowerCase());
      const country = (m.country || '').toLowerCase();
      const lang = (m.language || '').toLowerCase();

      if (platLower.includes('chorki')) {
        return (
          title.includes('chorki') ||
          syn.includes('chorki') ||
          country.includes('bangladesh') ||
          (title.includes('bengali') && (title.includes('web-dl') || title.includes('web series') || m.type === 'Series')) ||
          (formats.includes('bangla movies') && !title.includes('hoichoi'))
        );
      }
      if (platLower.includes('netflix')) {
        return title.includes('netflix') || syn.includes('netflix');
      }
      if (platLower.includes('hotstar') || platLower.includes('disney')) {
        return (
          title.includes('hotstar') ||
          title.includes('disney') ||
          syn.includes('hotstar') ||
          syn.includes('disney')
        );
      }
      if (platLower.includes('prime')) {
        return (
          title.includes('prime') ||
          title.includes('amazon') ||
          syn.includes('prime') ||
          syn.includes('amazon')
        );
      }
      if (platLower.includes('hoichoi')) {
        return title.includes('hoichoi') || syn.includes('hoichoi');
      }
      if (platLower.includes('bongo')) {
        return title.includes('bongo') || syn.includes('bongo');
      }
      if (platLower.includes('sony') || platLower.includes('sonyliv')) {
        return (
          title.includes('sony') ||
          title.includes('sonyliv') ||
          syn.includes('sony') ||
          syn.includes('sonyliv')
        );
      }
      if (platLower.includes('zee5') || platLower.includes('zee')) {
        return title.includes('zee5') || syn.includes('zee5');
      }
      if (platLower.includes('apple')) {
        return (
          title.includes('apple') ||
          title.includes('apple tv') ||
          syn.includes('apple')
        );
      }
      if (platLower.includes('klikk')) {
        return title.includes('klikk') || syn.includes('klikk');
      }
      return title.includes(platLower) || syn.includes(platLower);
    });
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
