import type { ListingType, ListingStatus, ListingCondition } from '@/types/database';

export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://onemulticoncepts.com.ng';

export const BUSINESS_NAME = 'O.N.E Multi-Concepts';

export const LISTING_TYPES: { value: ListingType; label: string; icon: string }[] = [
  { value: 'vehicle', label: 'Vehicle', icon: 'Car' },
  { value: 'accessory', label: 'Accessory', icon: 'Sparkles' },
  { value: 'spare_part', label: 'Spare Part', icon: 'Wrench' },
  { value: 'tyre', label: 'Tyre', icon: 'CircleDot' },
  { value: 'rim', label: 'Rim', icon: 'CircleDot' },
  { value: 'motorcycle', label: 'Motorcycle', icon: 'Bike' },
  { value: 'car_care', label: 'Car Care', icon: 'SprayCan' },
  { value: 'tool', label: 'Tool', icon: 'Hammer' },
  { value: 'other', label: 'Other', icon: 'Package' },
];

export const LISTING_STATUSES: { value: ListingStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'published', label: 'Published', color: 'bg-green-500/20 text-green-400' },
  { value: 'sold', label: 'Sold', color: 'bg-red-500/20 text-red-400' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'out_of_stock', label: 'Out of Stock', color: 'bg-orange-500/20 text-orange-400' },
];

export const LISTING_CONDITIONS: { value: ListingCondition; label: string }[] = [
  { value: 'new', label: 'Brand New' },
  { value: 'foreign_used', label: 'Foreign Used' },
  { value: 'nigerian_used', label: 'Nigerian Used' },
  { value: 'refurbished', label: 'Refurbished' },
];

export const VEHICLE_TRANSMISSIONS = [
  'Automatic',
  'Manual',
  'CVT',
  'Semi-Automatic',
];

export const VEHICLE_FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'CNG',
  'LPG',
];

export const VEHICLE_BODY_TYPES = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Coupe',
  'Convertible',
  'Wagon',
  'Van',
  'Pickup Truck',
  'Minivan',
  'Crossover',
  'Sports Car',
  'Bus',
];

export const VEHICLE_DRIVE_TYPES = [
  'Front-Wheel Drive (FWD)',
  'Rear-Wheel Drive (RWD)',
  'All-Wheel Drive (AWD)',
  'Four-Wheel Drive (4WD)',
];

export const TYRE_SEASONS = ['All Season', 'Summer', 'Winter', 'All Terrain'];

export const NIGERIAN_LOCATIONS = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Kano',
  'Ibadan',
  'Enugu',
  'Benin City',
  'Kaduna',
  'Jos',
  'Warri',
  'Calabar',
  'Owerri',
  'Uyo',
  'Abeokuta',
  'Onitsha',
  'Asaba',
  'Aba',
  'Ilorin',
  'Maiduguri',
  'Sokoto',
];

export const VEHICLE_FEATURES = [
  'Leather Seats',
  'Reverse Camera',
  'Bluetooth',
  'Apple CarPlay',
  'Android Auto',
  'Sunroof',
  'Parking Sensors',
  'Air Conditioning',
  'Touchscreen Display',
  'Navigation System',
  'Cruise Control',
  'Heated Seats',
  'Keyless Entry',
  'Push Start',
  'Lane Departure Warning',
  'Blind Spot Monitor',
  'Adaptive Cruise Control',
  'Panoramic Roof',
  '360 Camera',
  'Wireless Charging',
  'Premium Audio',
  'Third Row Seating',
  'Roof Rails',
  'LED Headlights',
  'Fog Lights',
  'Alloy Wheels',
  'Tinted Windows',
  'Power Windows',
  'Power Mirrors',
  'Central Locking',
];

export const ITEMS_PER_PAGE = 12;

export const CURRENCY_SYMBOL = '₦';

export const DEFAULT_COORDINATES = {
  lat: 6.6018,
  lng: 3.3515,
};
