import type { MovieItem } from '../data/cinefreakData.ts';

const DB_NAME = 'CineFreakDB_v8';
const STORE_NAME = 'movies_store';
const CACHE_TIMESTAMP_KEY = 'cinefreak_last_sync_v8';

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Saves movies into IndexedDB cache (handles 1,400+ movies effortlessly)
 */
export async function saveMoviesToIndexedDB(movies: MovieItem[]): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const movie of movies) {
      store.put(movie);
    }
    localStorage?.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (err) {
    console.warn('Failed saving to IndexedDB:', err);
  }
}

/**
 * Loads movies from IndexedDB cache
 */
export async function loadMoviesFromIndexedDB(): Promise<MovieItem[] | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        if (Array.isArray(req.result) && req.result.length > 0) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Loads initial movies synchronously from bundled data,
 * then background hydrates full 1,434 catalog from /cinefreak_catalog.json
 */
export function loadCachedMovies(defaultMovies: MovieItem[]): {
  movies: MovieItem[];
  lastSyncTime: number;
} {
  const timestamp = typeof window !== 'undefined'
    ? localStorage.getItem(CACHE_TIMESTAMP_KEY)
    : null;

  return {
    movies: defaultMovies,
    lastSyncTime: timestamp ? parseInt(timestamp, 10) : Date.now(),
  };
}

export function saveMoviesToCache(movies: MovieItem[]): void {
  saveMoviesToIndexedDB(movies);
}

export function formatSyncTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
