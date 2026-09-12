import { useQuery } from '@tanstack/react-query';
import { listingService } from '@/services/listingService';
import type { ListingFilters } from '@/types';

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingService.getListings(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['admin-listings', filters],
    queryFn: () => listingService.getAdminListings(filters),
    staleTime: 1 * 60 * 1000,
  });
}

export function useListing(slug: string) {
  return useQuery({
    queryKey: ['listing', slug],
    queryFn: () => listingService.getListingBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useListingById(id: string) {
  return useQuery({
    queryKey: ['listing-id', id],
    queryFn: () => listingService.getListingById(id),
    enabled: !!id,
  });
}

export function useFeaturedListings(limit = 8) {
  return useQuery({
    queryKey: ['featured-listings', limit],
    queryFn: () => listingService.getFeaturedListings(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentListings(limit = 6) {
  return useQuery({
    queryKey: ['recent-listings', limit],
    queryFn: () => listingService.getRecentListings(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useListingStats() {
  return useQuery({
    queryKey: ['listing-stats'],
    queryFn: () => listingService.getStats(),
    staleTime: 2 * 60 * 1000,
  });
}
