import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingCard, ListingCardSkeleton } from '@/components/shared/ListingCard';
import { useListings } from '@/hooks/useListings';
import { LISTING_CONDITIONS, VEHICLE_TRANSMISSIONS, VEHICLE_FUEL_TYPES, VEHICLE_BODY_TYPES, NIGERIAN_LOCATIONS } from '@/lib/constants';
import type { ListingFilters, ListingCondition } from '@/types';

export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || '';

  const filters: ListingFilters = {
    listing_type: 'vehicle',
    search: search || undefined,
    condition: (searchParams.get('condition') as ListingCondition) || undefined,
    location: searchParams.get('location') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    sort_by: (searchParams.get('sort') as 'price' | 'created_at') || 'created_at',
    sort_order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    page,
    per_page: 12,
  };

  const { data, isLoading } = useListings(filters);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dark bg-one-black min-h-screen">
      {/* Header */}
      <div className="bg-one-charcoal border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Vehicles</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Browse Our Vehicles</h1>
          <p className="text-gray-400 mt-2">
            Find the perfect car for your needs. From budget-friendly options to premium luxury rides, we've got you covered.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="lg:hidden gap-2 text-white border-white/20"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <p className="text-sm text-gray-400">
              {data ? `${data.count} vehicle${data.count !== 1 ? 's' : ''} found` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <Select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onValueChange={(v) => {
                const [sort, order] = v.split('-');
                updateFilter('sort', sort);
                updateFilter('order', order);
              }}
            >
              <SelectTrigger className="w-44 bg-one-charcoal border-white/10 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-one-charcoal border-white/10 text-white">
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-6`}>
            <div className="bg-one-charcoal rounded-xl p-4 border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" className="text-gray-400 text-xs" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Search */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Search</label>
                <Input
                  placeholder="Search vehicles..."
                  value={search}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  className="bg-one-black border-white/10 text-white text-sm"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Condition</label>
                <Select value={searchParams.get('condition') || ''} onValueChange={(v) => updateFilter('condition', v)}>
                  <SelectTrigger className="bg-one-black border-white/10 text-white text-sm">
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-charcoal border-white/10 text-white">
                    <SelectItem value="all">All Conditions</SelectItem>
                    {LISTING_CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Location</label>
                <Select value={searchParams.get('location') || ''} onValueChange={(v) => updateFilter('location', v)}>
                  <SelectTrigger className="bg-one-black border-white/10 text-white text-sm">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent className="bg-one-charcoal border-white/10 text-white">
                    <SelectItem value="all">All Locations</SelectItem>
                    {NIGERIAN_LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchParams.get('min_price') || ''}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    className="bg-one-black border-white/10 text-white text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchParams.get('max_price') || ''}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    className="bg-one-black border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <Button className="w-full" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
                : (data?.data || []).map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
            </div>

            {/* Empty State */}
            {!isLoading && data?.data.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg mb-2">No vehicles found</p>
                <p className="text-gray-500 mb-4">Try changing your filters or check back later.</p>
                <Button variant="outline" className="text-white border-white/20" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" /> Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(data.total_pages, 5) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      className={pageNum !== page ? 'text-white border-white/20' : ''}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20"
                  disabled={page >= data.total_pages}
                  onClick={() => goToPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
