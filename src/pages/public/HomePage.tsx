import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Car, Sparkles, Wrench, CircleDot, Bike, Package,
  Phone, MessageCircle, MapPin, ShieldCheck, Truck, Award,
  ChevronRight, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListingCard, ListingCardSkeleton } from '@/components/shared/ListingCard';
import { useSettings } from '@/hooks/useSettings';
import { useFeaturedListings, useRecentListings } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';

const categoryIcons: Record<string, React.ReactNode> = {
  car: <Car className="h-8 w-8" />,
  sparkles: <Sparkles className="h-8 w-8" />,
  wrench: <Wrench className="h-8 w-8" />,
  'circle-dot': <CircleDot className="h-8 w-8" />,
  bike: <Bike className="h-8 w-8" />,
  'spray-can': <Package className="h-8 w-8" />,
  hammer: <Wrench className="h-8 w-8" />,
  package: <Package className="h-8 w-8" />,
};

const categoryRoutes: Record<string, string> = {
  vehicles: '/vehicles',
  accessories: '/accessories',
  'spare-parts': '/spare-parts',
  'tyres-rims': '/tyres-rims',
  motorcycles: '/motorcycles',
  'car-care': '/products?type=car_care',
  tools: '/products?type=tool',
  other: '/products?type=other',
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: settings } = useSettings();
  const { data: featured, isLoading: featuredLoading } = useFeaturedListings(8);
  const { data: recent, isLoading: recentLoading } = useRecentListings(6);
  const { data: categories } = useCategories();

  const heroTitle = settings?.hero_title || 'Your One-Stop Auto Solution';
  const heroSubtitle = settings?.hero_subtitle || 'Quality vehicles, genuine parts, accessories and more — all in one place.';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="dark">
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center bg-one-black overflow-hidden">
        {/* Subtle gradient only at bottom-left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-one-black via-one-black/50 to-transparent z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: settings?.hero_image
              ? `url(${settings.hero_image})`
              : 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
          }}
        />

        <div className="container mx-auto px-4 relative z-20 py-20" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
          <div className="max-w-3xl space-y-6">
            <p className="text-one-red font-semibold text-sm uppercase tracking-wider drop-shadow-lg">
              Quality Rides. Genuine Parts. Trusted Deals.
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              {heroTitle}
            </h1>
            <p className="text-lg text-gray-300 max-w-xl">
              {heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link to="/vehicles">
                <Button size="lg" className="gap-2">
                  Browse Vehicles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/20 hover:bg-white/10">
                  Explore Auto Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="bg-one-black py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Choose a Category</h2>
            <p className="mt-1 text-sm text-gray-400">Tap any category to browse vehicles, parts, accessories and more.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories || []).slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={categoryRoutes[category.slug] || `/products?category=${category.slug}`}
                className="group bg-one-charcoal rounded-xl p-5 text-center hover:bg-one-charcoal-light hover:border-one-red/30 border border-white/5 transition-all duration-300"
              >
                <div className="flex justify-center mb-3 text-one-red">
                  {categoryIcons[category.icon || 'package'] || <Package className="h-8 w-8" />}
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{category.name}</h3>
                <p className="text-gray-500 text-xs line-clamp-1">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-one-black py-16 border-t border-white/5">
        <div className="container mx-auto px-0 sm:px-4">
          <div className="flex items-center justify-between mb-8 px-3 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-white">Featured Listings</h2>
              <p className="text-gray-400 text-sm mt-1">Top picks for you. Quality, affordability, and trust.</p>
            </div>
            <Link to="/vehicles" className="text-one-red hover:text-one-red-light text-sm font-medium flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px sm:gap-4">
            {featuredLoading
              ? Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)
              : (featured || []).slice(0, 4).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    className="rounded-none border-white/5 shadow-none sm:rounded-xl sm:border-white/10 sm:shadow [&>div:last-child]:p-2 sm:[&>div:last-child]:p-4"
                  />
                ))}
          </div>

          {!featuredLoading && (!featured || featured.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured listings yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-one-charcoal py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Why Choose O.N.E Multi-Concepts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Search className="h-6 w-6" />,
                title: 'Easy Search',
                desc: 'Find what you need, fast.',
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: 'Trusted & Verified',
                desc: 'Genuine products, real value.',
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: 'Nationwide Delivery',
                desc: 'Get your items wherever you are.',
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: 'Quality Products',
                desc: 'We focus on products worth your money.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl bg-one-black/50 border border-white/5">
                <div className="flex justify-center mb-4 text-one-red">{item.icon}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom CTA */}
      <section className="bg-one-black py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-one-charcoal to-one-black rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 border border-white/5">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-white">Come See Us</h2>
              <p className="text-gray-400">
                Visit our showroom to see our vehicles and products in person.
                We're always happy to help you find what you need.
              </p>
              {settings?.business_address && (
                <p className="flex items-start gap-2 text-gray-300">
                  <MapPin className="h-5 w-5 text-one-red shrink-0 mt-0.5" />
                  {settings.business_address}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link to="/showroom">
                  <Button size="lg" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </Button>
                </Link>
                {settings?.business_whatsapp && (
                  <a
                    href={`https://wa.me/${settings.business_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="whatsapp" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Chat with Us
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <div className="w-full lg:w-80 h-48 bg-one-charcoal-light rounded-xl flex items-center justify-center border border-white/10">
              <MapPin className="h-12 w-12 text-gray-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-one-red py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Drive Your Dreams</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Find your perfect vehicle, part, or accessory today. We're here to help.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/vehicles">
              <Button size="lg" variant="secondary" className="bg-white text-one-black hover:bg-gray-100 gap-2">
                Browse Vehicles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {settings?.business_phone && (
              <a href={`tel:${settings.business_phone}`}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  <Phone className="h-4 w-4" />
                  Call Us
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
