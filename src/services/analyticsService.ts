import { supabase } from '@/lib/supabase';
import type { EventType } from '@/types';
import { listingService } from '@/services/listingService';

const VIEW_DEDUPE_KEY = 'one_mc_seen_listing_views';
const VIEW_DEDUPE_MS = 24 * 60 * 60 * 1000;

export const analyticsService = {
  async trackEvent(eventType: EventType, listingId?: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        listing_id: listingId || null,
        metadata: metadata || {},
      });
    } catch {
      // Silently fail analytics - never break user experience
      console.warn('Failed to track analytics event');
    }
  },

  async trackListingView(listingId: string): Promise<boolean> {
    if (!shouldTrackListingView(listingId)) return false;

    await Promise.all([
      this.trackEvent('listing_view', listingId),
      listingService.incrementViews(listingId),
    ]);
    return true;
  },

  async getTopListings(eventType: EventType, limit = 10): Promise<{ listing_id: string; count: number }[]> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('listing_id')
      .eq('event_type', eventType)
      .not('listing_id', 'is', null);

    if (error) throw error;

    // Count occurrences
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      if (row.listing_id) {
        counts[row.listing_id] = (counts[row.listing_id] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([listing_id, count]) => ({ listing_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  async getEventCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type');

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.event_type] = (counts[row.event_type] || 0) + 1;
    }
    return counts;
  },
};

function shouldTrackListingView(listingId: string): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const now = Date.now();
    const raw = window.localStorage.getItem(VIEW_DEDUPE_KEY);
    const seen = raw ? JSON.parse(raw) as Record<string, number> : {};

    for (const [id, timestamp] of Object.entries(seen)) {
      if (now - timestamp > VIEW_DEDUPE_MS) {
        delete seen[id];
      }
    }

    if (seen[listingId] && now - seen[listingId] < VIEW_DEDUPE_MS) {
      window.localStorage.setItem(VIEW_DEDUPE_KEY, JSON.stringify(seen));
      return false;
    }

    seen[listingId] = now;
    window.localStorage.setItem(VIEW_DEDUPE_KEY, JSON.stringify(seen));
    return true;
  } catch {
    return true;
  }
}
