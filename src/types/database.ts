// ============================================================================
// Database Types for Supabase
// ============================================================================

export type ListingType =
  | 'vehicle'
  | 'accessory'
  | 'spare_part'
  | 'tyre'
  | 'rim'
  | 'motorcycle'
  | 'car_care'
  | 'tool'
  | 'other';

export type ListingStatus =
  | 'draft'
  | 'published'
  | 'sold'
  | 'archived'
  | 'out_of_stock';

export type ListingCondition =
  | 'new'
  | 'foreign_used'
  | 'nigerian_used'
  | 'refurbished';

export type EnquiryStatus = 'new' | 'contacted' | 'closed';

// ============================================================================
// Table Row Types
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  listing_type: ListingType;
  category_id: string | null;
  brand_id: string | null;
  price: number | null;
  previous_price: number | null;
  condition: ListingCondition | null;
  location: string | null;
  status: ListingStatus;
  featured: boolean;
  negotiable: boolean;
  contact_enabled: boolean;
  specifications: Record<string, unknown>;
  features: string[];
  seo_title: string | null;
  seo_description: string | null;
  views_count: number;
  whatsapp_clicks: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations (optional, joined)
  category?: Category;
  brand?: Brand;
  images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  media_type: 'image' | 'video';
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface Enquiry {
  id: string;
  listing_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
  // Joined
  listing?: Listing;
}

export interface WebsiteSetting {
  id: string;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  listing_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateListingInput {
  title: string;
  description?: string;
  listing_type: ListingType;
  category_id?: string;
  brand_id?: string;
  price?: number;
  previous_price?: number;
  condition?: ListingCondition;
  location?: string;
  status?: ListingStatus;
  featured?: boolean;
  negotiable?: boolean;
  contact_enabled?: boolean;
  specifications?: Record<string, unknown>;
  features?: string[];
  seo_title?: string;
  seo_description?: string;
  slug?: string;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  id: string;
}

export interface CreateEnquiryInput {
  listing_id?: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  icon?: string;
  sort_order?: number;
}

export interface CreateBrandInput {
  name: string;
  slug?: string;
  logo_url?: string;
}

// ============================================================================
// Specification Types
// ============================================================================

export interface VehicleSpecifications {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  transmission?: string;
  fuel_type?: string;
  engine?: string;
  body_type?: string;
  drive_type?: string;
  exterior_color?: string;
  interior_color?: string;
}

export interface TyreSpecifications {
  width?: number;
  aspect_ratio?: number;
  rim_size?: number;
  season?: string;
  load_index?: string;
  speed_rating?: string;
}

export interface AccessorySpecifications {
  compatibility?: string;
  material?: string;
  color?: string;
  quantity?: number;
}

export interface SparePartSpecifications {
  part_number?: string;
  compatible_vehicles?: string;
  quantity?: number;
}

export interface MotorcycleSpecifications {
  make?: string;
  model?: string;
  year?: number;
  engine_size?: string;
  motorcycle_type?: string;
  mileage?: number;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface ListingFilters {
  search?: string;
  listing_type?: ListingType;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: ListingCondition;
  location?: string;
  status?: ListingStatus;
  featured?: boolean;
  sort_by?: 'created_at' | 'price' | 'title' | 'views_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================================================
// Settings Types
// ============================================================================

export type WebsiteSettings = Record<string, string>;

export interface WhatsAppSettings {
  whatsapp_number: string;
  templates: Record<string, string>;
}

// ============================================================================
// Event Types
// ============================================================================

export type EventType =
  | 'site_visit'
  | 'listing_view'
  | 'whatsapp_click'
  | 'call_click'
  | 'share_click'
  | 'favorite_click'
  | 'directions_click';

// ============================================================================
// Supabase Database Type
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: any;
        Update: any;
      };
      categories: {
        Row: Category;
        Insert: any;
        Update: any;
      };
      brands: {
        Row: Brand;
        Insert: any;
        Update: any;
      };
      listings: {
        Row: Listing;
        Insert: any;
        Update: any;
      };
      listing_images: {
        Row: ListingImage;
        Insert: any;
        Update: any;
      };
      enquiries: {
        Row: Enquiry;
        Insert: any;
        Update: any;
      };
      website_settings: {
        Row: WebsiteSetting;
        Insert: any;
        Update: any;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: any;
        Update: any;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_views: {
        Args: { listing_id: string };
        Returns: void;
      };
    };
    Enums: {
      listing_type: ListingType;
      listing_status: ListingStatus;
      listing_condition: ListingCondition;
      enquiry_status: EnquiryStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
