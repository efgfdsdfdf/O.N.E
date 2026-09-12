import { supabase } from '@/lib/supabase';
import type { EventType } from '@/types';

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
