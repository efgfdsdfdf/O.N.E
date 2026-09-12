import { useState, useCallback, useSyncExternalStore } from 'react';
import { favoriteService } from '@/services/favoriteService';
import { analyticsService } from '@/services/analyticsService';

// Simple event emitter for favorites changes
let listeners: (() => void)[] = [];
function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return JSON.stringify(favoriteService.getAll());
}

export function useFavorites() {
  const favoritesJson = useSyncExternalStore(subscribe, getSnapshot);
  const favoriteIds: string[] = JSON.parse(favoritesJson);

  const isFavorite = useCallback(
    (listingId: string) => favoriteIds.includes(listingId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((listingId: string) => {
    const isNowFavorite = favoriteService.toggle(listingId);
    if (isNowFavorite) {
      analyticsService.trackEvent('favorite_click', listingId);
    }
    emitChange();
    return isNowFavorite;
  }, []);

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    count: favoriteIds.length,
  };
}
