import type { Listing, ListingType } from '@/types';
import { formatNaira } from './currency';
import { SITE_URL } from '@/lib/constants';

export function getListingUrl(listing: Listing): string {
  const typePrefix = listing.listing_type === 'vehicle' || listing.listing_type === 'motorcycle'
    ? 'vehicles'
    : 'products';
  return `${SITE_URL}/${typePrefix}/${listing.slug}`;
}

export function getListingPath(listing: Listing): string {
  const typePrefix = listing.listing_type === 'vehicle' || listing.listing_type === 'motorcycle'
    ? 'vehicles'
    : 'products';
  return `/${typePrefix}/${listing.slug}`;
}

export function getDefaultTemplate(listingType: ListingType): string {
  const templates: Record<string, string> = {
    vehicle: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. Is it still available?\n\nPrice: {price}\nListing: {url}",
    motorcycle: "Hello O.N.E Multi-Concepts, I'm interested in the {title} listed on your website. Is it still available?\n\nPrice: {price}\nListing: {url}",
    accessory: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. Is it still available?\n\nPrice: {price}\nListing: {url}",
    spare_part: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. I'd like to confirm compatibility and availability.\n\nPrice: {price}\nListing: {url}",
    tyre: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. Please confirm availability and price.\n\nPrice: {price}\nListing: {url}",
    rim: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. Please confirm availability and price.\n\nPrice: {price}\nListing: {url}",
    car_care: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. Is it still available?\n\nPrice: {price}\nListing: {url}",
    tool: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. Is it still available?\n\nPrice: {price}\nListing: {url}",
    other: "Hello O.N.E Multi-Concepts, I'm interested in the {title}. Is it still available?\n\nPrice: {price}\nListing: {url}",
  };
  return templates[listingType] || templates.other;
}

export function generateWhatsAppMessage(
  listing: Listing,
  template?: string
): string {
  const url = getListingUrl(listing);
  const price = formatNaira(listing.price);
  const messageTemplate = template || getDefaultTemplate(listing.listing_type);

  return messageTemplate
    .replace(/\{title\}/g, listing.title)
    .replace(/\{price\}/g, price)
    .replace(/\{url\}/g, url)
    .replace(/\{category\}/g, listing.listing_type.replace('_', ' '));
}

export function generateSoldMessage(listing: Listing): string {
  return `Hello O.N.E Multi-Concepts, I saw the ${listing.title} on your website but it's marked as sold. Do you have anything similar available?\n\nListing: ${getListingUrl(listing)}`;
}

export function generateOutOfStockMessage(listing: Listing): string {
  return `Hello O.N.E Multi-Concepts, I'm interested in the ${listing.title} but it's out of stock. When will it be available again?\n\nListing: ${getListingUrl(listing)}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function buildPhoneUrl(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleanPhone}`;
}

export function buildDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
