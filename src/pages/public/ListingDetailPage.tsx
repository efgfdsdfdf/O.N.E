import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Heart, Share2, Phone, MessageCircle,
  ChevronLeft, ChevronRight, Maximize2, X,
  Fuel, Gauge, Settings2, Calendar, Palette, Car,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { useListing } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useSettings } from '@/hooks/useSettings';
import { analyticsService } from '@/services/analyticsService';
import { listingService } from '@/services/listingService';
import { formatNaira } from '@/utils/currency';
import { getConditionLabel, formatMileage, getListingTypeLabel, formatDate } from '@/utils/helpers';
import { buildPhoneUrl, buildDirectionsUrl } from '@/utils/whatsapp';
import type { VehicleSpecifications } from '@/types';

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading, error } = useListing(slug || '');
  const { data: settings } = useSettings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const phone = settings?.business_phone || '';
  const whatsapp = settings?.business_whatsapp || '';

  useEffect(() => {
    if (listing) {
      analyticsService.trackListingView(listing.id);
    }
  }, [listing?.id]);

  if (isLoading) {
    return (
      <div className="dark bg-one-black min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <Skeleton className="aspect-[4/3] rounded-xl bg-one-charcoal" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-one-charcoal" />
              <Skeleton className="h-10 w-1/2 bg-one-charcoal" />
              <Skeleton className="h-20 w-full bg-one-charcoal" />
              <Skeleton className="h-12 w-full bg-one-charcoal" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="dark bg-one-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Listing not found</h2>
          <p className="text-gray-400 mb-4">This listing may have been removed or doesn't exist.</p>
          <Link to="/vehicles">
            <Button>Browse Vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const specs = listing.specifications as VehicleSpecifications;
  const images = (listing.images || []).sort((a, b) => a.sort_order - b.sort_order);
  const currentImageUrl = images[selectedImage]
    ? listingService.getImageUrl(images[selectedImage].storage_path)
    : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%231a1a1a"><rect width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="%23666" font-size="18">No Image</text></svg>';
  const currentMedia = images[selectedImage];
  const isVideo = (path: string) => /\.(mp4|webm|mov|ogg)$/i.test(path || '');
  const currentIsVideo = currentMedia && isVideo(currentMedia.storage_path);

  const isSold = listing.status === 'sold';
  const isOutOfStock = listing.status === 'out_of_stock';
  const favorite = isFavorite(listing.id);

  const handleShare = async () => {
    analyticsService.trackEvent('share_click', listing.id);
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleCall = () => {
    analyticsService.trackEvent('call_click', listing.id);
    window.location.href = buildPhoneUrl(phone);
  };

  const specItems = specs ? [
    { icon: <Calendar className="h-4 w-4" />, label: 'Year', value: specs.year },
    { icon: <Gauge className="h-4 w-4" />, label: 'Mileage', value: specs.mileage ? formatMileage(specs.mileage) : null },
    { icon: <Settings2 className="h-4 w-4" />, label: 'Transmission', value: specs.transmission },
    { icon: <Fuel className="h-4 w-4" />, label: 'Fuel', value: specs.fuel_type },
    { icon: <Car className="h-4 w-4" />, label: 'Body', value: specs.body_type },
    { icon: <Palette className="h-4 w-4" />, label: 'Color', value: specs.exterior_color },
  ].filter((s) => s.value) : [];

  return (
    <div className="dark bg-one-black min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-white">
            {listing.listing_type === 'vehicle' ? 'Vehicles' : getListingTypeLabel(listing.listing_type)}
          </Link>
          <span>/</span>
          <span className="text-white truncate">{listing.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 lg:pb-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div
              className="relative flex h-[min(58vh,430px)] min-h-[280px] items-center justify-center rounded-xl overflow-hidden bg-one-charcoal cursor-pointer group sm:h-[min(62vh,560px)] lg:aspect-[4/3] lg:h-auto lg:min-h-0"
              onClick={() => setFullscreen(true)}
            >
              {currentIsVideo ? (
                <video
                  src={currentImageUrl}
                  className="h-full w-full object-contain object-center"
                  controls
                  playsInline
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={currentImageUrl}
                  alt={listing.title}
                  className="h-full w-full object-contain object-center"
                />
              )}
              {/* Status overlay */}
              {isSold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="sold" className="text-xl px-6 py-2">SOLD</Badge>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-black/40 text-white hover:bg-black/60"
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 bg-one-charcoal transition-all ${
                      i === selectedImage ? 'border-one-red' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isVideo(img.storage_path) ? (
                      <video
                        src={listingService.getImageUrl(img.storage_path)}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-contain object-center"
                      />
                    ) : (
                      <img
                        src={listingService.getImageUrl(img.storage_path)}
                        alt=""
                        className="h-full w-full object-contain object-center"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-5">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {listing.condition && (
                  <Badge variant="secondary" className="text-xs">{getConditionLabel(listing.condition)}</Badge>
                )}
                {listing.featured && <Badge variant="featured" className="text-xs">Featured</Badge>}
                {isSold && <Badge variant="sold">SOLD</Badge>}
                {isOutOfStock && <Badge variant="warning">OUT OF STOCK</Badge>}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{listing.title}</h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-one-red">{formatNaira(listing.price)}</span>
              {listing.previous_price && listing.previous_price > (listing.price || 0) && (
                <span className="text-gray-500 line-through">{formatNaira(listing.previous_price)}</span>
              )}
            </div>
            {listing.negotiable && (
              <Badge variant="outline" className="text-gray-400 border-gray-600">Negotiable</Badge>
            )}

            {/* Key Specs */}
            {specItems.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {specItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className="text-one-red">{item.icon}</span>
                    <span className="text-gray-400">{item.label}:</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Location */}
            {listing.location && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-one-red" />
                {listing.location}
              </div>
            )}

            <Separator className="bg-white/10" />

            {/* CTAs */}
            <div className="space-y-3">
              <WhatsAppButton
                listing={listing}
                size="xl"
                fullWidth
                variant={isSold ? 'sold' : isOutOfStock ? 'out_of_stock' : 'default'}
              />
              {phone && (
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full gap-2 text-white border-white/20 hover:bg-white/10"
                  onClick={handleCall}
                >
                  <Phone className="h-4 w-4" />
                  Call Seller
                </Button>
              )}
            </div>

            {/* Share & Favorite */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-white border-white/20"
                onClick={() => toggleFavorite(listing.id)}
              >
                <Heart className={`h-4 w-4 ${favorite ? 'fill-one-red text-one-red' : ''}`} />
                {favorite ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-white border-white/20"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-one-charcoal border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-one-red data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="specs" className="data-[state=active]:bg-one-red data-[state=active]:text-white">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-one-red data-[state=active]:text-white">
                Features
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="bg-one-charcoal rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {listing.description || 'No description provided.'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <div className="bg-one-charcoal rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(listing.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <div className="bg-one-charcoal rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                {listing.features && listing.features.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {listing.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-gray-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-one-red shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No features listed.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-one-charcoal/95 backdrop-blur border-t border-white/10 p-3 flex gap-3 lg:hidden z-40">
        {phone && (
          <Button
            variant="outline"
            className="flex-1 gap-2 text-white border-white/20"
            onClick={handleCall}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
        )}
        <WhatsAppButton
          listing={listing}
          className="flex-1"
          variant={isSold ? 'sold' : isOutOfStock ? 'out_of_stock' : 'default'}
        />
      </div>

      {/* Fullscreen Image */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white z-10"
            onClick={() => setFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          {currentIsVideo ? (
            <video
              src={currentImageUrl}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={currentImageUrl}
              alt={listing.title}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
}
