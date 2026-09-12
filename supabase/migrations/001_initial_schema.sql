-- ============================================================================
-- O.N.E Multi-Concepts - Database Schema
-- Complete PostgreSQL migration for Supabase
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE listing_type AS ENUM (
  'vehicle', 'accessory', 'spare_part', 'tyre', 'rim',
  'motorcycle', 'car_care', 'tool', 'other'
);

CREATE TYPE listing_status AS ENUM (
  'draft', 'published', 'sold', 'archived', 'out_of_stock'
);

CREATE TYPE listing_condition AS ENUM (
  'new', 'foreign_used', 'nigerian_used', 'refurbished'
);

CREATE TYPE enquiry_status AS ENUM (
  'new', 'contacted', 'closed'
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate URL-safe slug from title
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    RETURN NEW;
  END IF;
  
  base_slug := lower(trim(NEW.title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM listings WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listings (core table)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  listing_type listing_type NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  price NUMERIC(15,2),
  previous_price NUMERIC(15,2),
  condition listing_condition,
  location TEXT,
  status listing_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  negotiable BOOLEAN NOT NULL DEFAULT false,
  contact_enabled BOOLEAN NOT NULL DEFAULT true,
  specifications JSONB NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listing Images
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enquiries
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT NOT NULL,
  status enquiry_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Website Settings (key-value store)
CREATE TABLE website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_type ON listings(listing_type);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_brand ON listings(brand_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = true;
CREATE INDEX idx_listings_status_type ON listings(status, listing_type);

-- Full-text search index
CREATE INDEX idx_listings_search ON listings USING GIN(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);
CREATE INDEX idx_listing_images_cover ON listing_images(listing_id, is_cover) WHERE is_cover = true;

CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX idx_enquiries_listing ON enquiries(listing_id);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_listing ON analytics_events(listing_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

CREATE INDEX idx_settings_key ON website_settings(key);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON website_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER generate_slug_on_insert
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION generate_listing_slug();

CREATE TRIGGER generate_slug_on_update
  BEFORE UPDATE OF title ON listings
  FOR EACH ROW
  WHEN (OLD.title IS DISTINCT FROM NEW.title AND (NEW.slug IS NULL OR NEW.slug = OLD.slug))
  EXECUTE FUNCTION generate_listing_slug();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- CATEGORIES (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin());

-- BRANDS (public read, admin write)
CREATE POLICY "Anyone can view brands"
  ON brands FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage brands"
  ON brands FOR ALL
  USING (is_admin());

-- LISTINGS (public read published, admin full)
CREATE POLICY "Anyone can view published listings"
  ON listings FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR status = 'sold');

CREATE POLICY "Admins can manage all listings"
  ON listings FOR ALL
  USING (is_admin());

-- LISTING IMAGES (public read, admin write)
CREATE POLICY "Anyone can view listing images"
  ON listing_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND (listings.status = 'published' OR listings.status = 'sold')
    )
  );

CREATE POLICY "Admins can manage listing images"
  ON listing_images FOR ALL
  USING (is_admin());

-- ENQUIRIES (public insert, admin full)
CREATE POLICY "Anyone can submit enquiries"
  ON enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage enquiries"
  ON enquiries FOR ALL
  USING (is_admin());

-- WEBSITE SETTINGS (public read, admin write)
CREATE POLICY "Anyone can view settings"
  ON website_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON website_settings FOR ALL
  USING (is_admin());

-- ANALYTICS EVENTS (public insert, admin read)
CREATE POLICY "Anyone can create analytics events"
  ON analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON analytics_events FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage analytics"
  ON analytics_events FOR ALL
  USING (is_admin());

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS (run these in Supabase Dashboard > Storage)
-- ============================================================================
-- Create buckets:
--   1. 'listings' - Public bucket for listing images
--   2. 'categories' - Public bucket for category images
--   3. 'website' - Public bucket for hero images, branding, logos
--
-- Storage Policies:
--   - Public read on all buckets
--   - Authenticated admin write on all buckets
-- ============================================================================
