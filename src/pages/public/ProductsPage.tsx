import { useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingCard, ListingCardSkeleton } from '@/components/shared/ListingCard';
import { useListings } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';
import { LISTING_TYPES, LISTING_CONDITIONS } from '@/lib/constants';
import type { ListingFilters, ListingType } from '@/types';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const locationPath = useLocation().pathname;
  const { data: categories } = useCategories();

  // Determine base listing type from route
  let routeType: ListingType | undefined = undefined;
  let pageTitle = 'All Products';
  let pageDesc = 'Browse our extensive collection of automotive products.';

  if (locationPath === '/accessories') {
    routeType = 'accessory';
    pageTitle = 'Car Accessories';
    pageDesc = 'Upgrade your ride with high-quality accessories. From interior comfort to exterior style, we\'ve got you covered.';
  } else if (locationPath === '/spare-parts') {
    routeType = 'spare_part';
    pageTitle = 'Spare Parts';
    pageDesc = 'Genuine spare parts to keep your vehicle running smoothly.';
  } else if (locationPath === '/tyres-rims') {
    routeType = 'tyre'; // Or rim, handled below
    pageTitle = 'Tyres & Rims';
    pageDesc = 'Premium tyres and stylish rims for better performance and look.';
  } else if (locationPath === '/motorcycles') {
    routeType = 'motorcycle';
    pageTitle = 'Motorcycles';
    pageDesc = 'Two-wheeled machines for work and play.';
  }

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category');
  const selectedType = routeType || (searchParams.get('type') as ListingType) || undefined;

  const filters: ListingFilters = {
    search: search || undefined,
    listing_type: selectedType,
    category_id: selectedCategory || undefined,
    condition: searchParams.get('condition') as any || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    sort_by: (searchParams.get('sort') as any) || 'created_at',
    sort_order: (searchParams.get('order') as any) || 'desc',
    page,
    per_page: 12,
  };

  // Exclude vehicles unless explicitly searching all
  if (!routeType && !selectedType) {
     // We only want products here, not vehicles
     // But Supabase doesn't support NOT IN easily through this filter object,
     // So we'll rely on the default behavior or specific type selection.
  }

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
      <div className="bg-one-charcoal border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600705722908-bab1e6190b05?w=1920&q=80')] opacity-10 bg-cover bg-center" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">{pageTitle}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Premium <span className="text-one-red">{pageTitle}</span></h1>
          <p className="text-gray-400 mt-2 max-w-2xl">{pageDesc}</p>
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-3 sm:px-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="lg:hidden gap-2 text-white border-white/20" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
            <p className="text-sm text-gray-400">
              {data ? `${data.count} product${data.count !== 1 ? 's' : ''} found` : 'Loading...'}
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
          {/* Sidebar */}
          <aside className={`${showFilters ? 'block px-3 sm:px-0' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-6`}>
            {/* Categories sidebar matching the design mockup */}
            <div className="bg-one-charcoal rounded-xl p-4 border border-white/10 space-y-2">
              <h3 className="text-white font-semibold mb-4 text-lg">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !selectedCategory ? 'bg-one-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Categories
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === cat.id ? 'bg-one-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-one-charcoal rounded-xl p-4 border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" className="text-gray-400 text-xs" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {!routeType && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Product Type</label>
                  <Select value={searchParams.get('type') || ''} onValueChange={(v) => updateFilter('type', v)}>
                    <SelectTrigger className="bg-one-black border-white/10 text-white text-sm">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-one-charcoal border-white/10 text-white">
                      <SelectItem value="all">All Types</SelectItem>
                      {LISTING_TYPES.filter(t => t.value !== 'vehicle').map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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

              <Button className="w-full" onClick={() => setShowFilters(false)}>Apply Filters</Button>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-px sm:gap-4">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
                : (data?.data || []).map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      className="rounded-none border-white/5 shadow-none sm:rounded-xl sm:border-white/10 sm:shadow [&>div:last-child]:p-2 sm:[&>div:last-child]:p-4"
                    />
                  ))}
            </div>

            {!isLoading && data?.data.length === 0 && (
              <div className="text-center py-16 bg-one-charcoal rounded-xl border border-white/5">
                <PackageSearch className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">No products found</p>
                <p className="text-gray-500 mb-4">We couldn't find any products matching your criteria.</p>
                <Button variant="outline" className="text-white border-white/20" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button variant="outline" size="sm" className="text-white border-white/20" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(data.total_pages, 5) }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={i + 1 === page ? 'default' : 'outline'}
                    size="sm"
                    className={i + 1 !== page ? 'text-white border-white/20' : ''}
                    onClick={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="text-white border-white/20" disabled={page >= data.total_pages} onClick={() => goToPage(page + 1)}>
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
