import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMovies, filterRecentItems, paginate } from './movieFilter.ts';
import type { MovieItem, RecentItem } from '../data/cinefreakData.ts';

const dummyMovies: MovieItem[] = [
  {
    id: '1',
    title: 'Colony (2026) Dual Audio [Hindi & English] WEB-DL',
    cleanName: 'Colony',
    poster: 'p1.jpg',
    timeAgo: '10 hours ago',
    trending: true,
    formats: ['WEB-DL', 'Dual Audio'],
    status: '',
    has4k: false,
    type: 'Movie',
    rating: '7.8',
    genres: ['Action', 'Sci-Fi'],
    releaseDate: '2026',
    runtime: '2h',
    country: 'USA',
    language: 'Hindi & English',
    subtitle: 'English',
    quality: '1080p',
    videoFormat: 'MKV',
    synopsis: 'Test plot',
    screenshots: [],
    downloads: [],
  },
  {
    id: '2',
    title: 'VisionQuest (2026) Disney+ Hotstar Original Web series Season 1',
    cleanName: 'VisionQuest',
    poster: 'p2.jpg',
    timeAgo: '1 day ago',
    trending: false,
    formats: ['WEB-Series', 'Dual Audio'],
    status: 'EP 01',
    has4k: true,
    type: 'Series',
    rating: '8.2',
    genres: ['Action', 'Drama'],
    releaseDate: '2026',
    runtime: '45m',
    country: 'USA',
    language: 'Hindi & English',
    subtitle: 'English',
    quality: '4K',
    videoFormat: 'MKV',
    synopsis: 'Test series',
    screenshots: [],
    downloads: [],
  },
];

test('filterMovies matches search query', () => {
  const result = filterMovies(dummyMovies, 'Colony', 'All', null, null);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '1');
});

test('filterMovies matches 4K category', () => {
  const result = filterMovies(dummyMovies, '', '4K', null, null);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '2');
});

test('filterMovies matches platform Disney+ Hotstar', () => {
  const result = filterMovies(dummyMovies, '', 'All', 'Disney+ Hotstar', null);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '2');
});

test('filterRecentItems filters by type or ep', () => {
  const recent: RecentItem[] = [
    { id: 1, t: 100, tag: 'New', k: 'new', type: 'Movie', title: 'M1', sub: '', link: '', poster: '' },
    { id: 2, t: 101, tag: 'EP 12 added', k: 'ep', type: 'Series', title: 'S1', sub: '', link: '', poster: '' },
  ];
  assert.equal(filterRecentItems(recent, 'Movie').length, 1);
  assert.equal(filterRecentItems(recent, 'Series').length, 1);
  assert.equal(filterRecentItems(recent, 'ep').length, 1);
  assert.equal(filterRecentItems(recent, 'all').length, 2);
});

test('paginate slices correctly', () => {
  const items = [1, 2, 3, 4, 5, 6, 7];
  const page1 = paginate(items, 1, 3);
  assert.equal(page1.items.length, 3);
  assert.equal(page1.totalPages, 3);
  assert.equal(page1.currentPage, 1);

  const page3 = paginate(items, 3, 3);
  assert.equal(page3.items.length, 1);
  assert.equal(page3.currentPage, 3);
});

test('all movies have unique valid non-empty slugs', async () => {
  const { MOVIES } = await import('../data/cinefreakData.ts');
  const slugs = MOVIES.map((m) => m.slug);
  assert.equal(slugs.length > 0, true);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) {
    assert.match(s, /^[a-z0-9-]+$/);
  }
});
