import { Link } from 'react-router-dom';
import { MapPin, Heart, Fuel, Gauge, Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { listingService } from '@/services/listingService';
import { formatNaira } from '@/utils/currency';
import { getConditionLabel, formatMileage, getListingTypeLabel } from '@/utils/helpers';
import { getListingPath } from '@/utils/whatsapp';
import type { Listing, VehicleSpecifications } from '@/types';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(listing.id);
  const specs = listing.specifications as VehicleSpecifications;

  // Get cover image
  const coverImage = listing.images?.find((img) => img.is_cover) || listing.images?.[0];
  const imageUrl = coverImage
    ? listingService.getImageUrl(coverImage.storage_path)
    : '/placeholder-car.jpg';
  const isVideo = coverImage?.media_type === 'video';

  const isSold = listing.status === 'sold';
  const isOutOfStock = listing.status === 'out_of_stock';

  return (
    <Card className={cn(
      'group overflow-hidden bg-one-charcoal border-white/10 hover:border-one-red/50 transition-all duration-300',
      className
    )}>
      <Link to={getListingPath(listing)}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-one-black">
          {isVideo ? (
            <video
              src={imageUrl}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <img
              src={imageUrl}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%231a1a1a"><rect width="400" height="300"/><text x="200" y="150" text-anchor="middle" fill="%23666" font-size="14">No Image</text></svg>';
              }}
            />
          )}
          {isVideo && (
            <Badge className="absolute bottom-2 left-2 text-xs bg-black/70 text-white border-0">Video</Badge>
          )}

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {listing.featured && (
              <Badge variant="featured" className="text-xs">Featured</Badge>
            )}
            {isSold && (
              <Badge variant="sold" className="text-xs">SOLD</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="warning" className="text-xs">OUT OF STOCK</Badge>
            )}
            {listing.condition && (
              <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
                {getConditionLabel(listing.condition)}
              </Badge>
            )}
          </div>

          {/* Favorite */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(listing.id);
            }}
          >
            <Heart className={cn('h-4 w-4', favorite ? 'fill-one-red text-one-red' : 'text-white')} />
          </Button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        <Link to={getListingPath(listing)}>
          <h3 className="font-semibold text-white line-clamp-1 group-hover:text-one-red transition-colors">
            {listing.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-one-red">
            {formatNaira(listing.price)}
          </span>
          {listing.previous_price && listing.previous_price > (listing.price || 0) && (
            <span className="text-xs text-gray-500 line-through">
              {formatNaira(listing.previous_price)}
            </span>
          )}
          {listing.negotiable && (
            <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-600">
              Negotiable
            </Badge>
          )}
        </div>

        {/* Specs Row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
          {listing.listing_type === 'vehicle' && specs && (
            <>
              {specs.transmission && (
                <span className="flex items-center gap-1">
                  <Settings2 className="h-3 w-3" />
                  {specs.transmission}
                </span>
              )}
              {specs.mileage && (
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  {formatMileage(specs.mileage)}
                </span>
              )}
              {specs.fuel_type && (
                <span className="flex items-center gap-1">
                  <Fuel className="h-3 w-3" />
                  {specs.fuel_type}
                </span>
              )}
            </>
          )}
          {listing.listing_type !== 'vehicle' && (
            <span className="text-gray-500">
              {getListingTypeLabel(listing.listing_type)}
            </span>
          )}
        </div>

        {/* Location */}
        {listing.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </div>
        )}
      </div>
    </Card>
  );
}

// Skeleton version
export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-one-charcoal border-white/10">
      <div className="aspect-[4/3] bg-one-black animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
        <div className="h-5 bg-white/5 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-white/5 rounded animate-pulse w-2/3" />
        <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
      </div>
    </Card>
  );
}
