import type { Listing } from '@/types';

const FAVORITES_KEY = 'one_mc_favorites';

function getFavoriteIds(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export const favoriteService = {
  getAll(): string[] {
    return getFavoriteIds();
  },

  isFavorite(listingId: string): boolean {
    return getFavoriteIds().includes(listingId);
  },

  toggle(listingId: string): boolean {
    const ids = getFavoriteIds();
    const index = ids.indexOf(listingId);
    if (index > -1) {
      ids.splice(index, 1);
      saveFavoriteIds(ids);
      return false;
    } else {
      ids.push(listingId);
      saveFavoriteIds(ids);
      return true;
    }
  },

  add(listingId: string): void {
    const ids = getFavoriteIds();
    if (!ids.includes(listingId)) {
      ids.push(listingId);
      saveFavoriteIds(ids);
    }
  },

  remove(listingId: string): void {
    const ids = getFavoriteIds();
    const filtered = ids.filter((id) => id !== listingId);
    saveFavoriteIds(filtered);
  },

  count(): number {
    return getFavoriteIds().length;
  },
};
