-- ============================================================================
-- O.N.E Multi-Concepts - Seed Data
-- Run this AFTER 001_initial_schema.sql
-- ============================================================================

-- Categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Vehicles', 'vehicles', 'Cars, SUVs, trucks and more', 'car', 1),
('Accessories', 'accessories', 'Interior and exterior accessories', 'sparkles', 2),
('Spare Parts', 'spare-parts', 'Genuine parts for different vehicles', 'wrench', 3),
('Tyres & Rims', 'tyres-rims', 'Tyres, wheels and rims', 'circle-dot', 4),
('Motorcycles', 'motorcycles', 'Motorcycles and related products', 'bike', 5),
('Car Care', 'car-care', 'Products for keeping your vehicle clean and maintained', 'spray-can', 6),
('Tools', 'tools', 'Automotive tools and equipment', 'hammer', 7),
('Other', 'other', 'Other automotive products', 'package', 8);

-- Website Settings
INSERT INTO website_settings (key, value) VALUES
('business_name', 'O.N.E Multi-Concepts'),
('business_phone', '+2349059992303'),
('business_whatsapp', '+2349059992303'),
('business_email', 'onemulticoncepts.autos@gmail.com'),
('business_address', 'Lagos, Nigeria'),
('business_city', 'Lagos'),
('business_state', 'Lagos'),
('business_country', 'Nigeria'),
('business_coordinates_lat', '6.6018'),
('business_coordinates_lng', '3.3515'),
('business_opening_hours', '{"Monday":"9:00 AM - 6:00 PM","Tuesday":"9:00 AM - 6:00 PM","Wednesday":"9:00 AM - 6:00 PM","Thursday":"9:00 AM - 6:00 PM","Friday":"9:00 AM - 6:00 PM","Saturday":"10:00 AM - 4:00 PM","Sunday":"Closed"}'),
('hero_title', 'Your One-Stop Auto Solution'),
('hero_subtitle', 'Quality vehicles, genuine parts, accessories and more — all in one place.'),
('hero_image', ''),
('about_text', 'O.N.E Multi-Concepts is an automotive business focused on helping customers find quality vehicles, parts, accessories and other automotive products. We believe in honest deals, quality products, and making the car buying experience simple and personal.'),
('social_instagram', ''),
('social_facebook', ''),
('social_tiktok', ''),
('social_twitter', ''),
('footer_text', '© O.N.E Multi-Concepts. More Than Just a Dealership.'),
('site_url', 'https://onemulticoncepts.com.ng'),
('whatsapp_template_vehicle', 'Hello O.N.E Multi-Concepts, I''m interested in the {title}. Is it still available?

Price: {price}
Listing: {url}'),
('whatsapp_template_accessory', 'Hello O.N.E Multi-Concepts, I''m interested in the {title}. Is it still available?

Price: {price}
Listing: {url}'),
('whatsapp_template_spare_part', 'Hello O.N.E Multi-Concepts, I''m interested in the {title}. I''d like to confirm compatibility and availability.

Price: {price}
Listing: {url}'),
('whatsapp_template_tyre', 'Hello O.N.E Multi-Concepts, I''m interested in the {title}. Please confirm availability and price.

Price: {price}
Listing: {url}'),
('whatsapp_template_motorcycle', 'Hello O.N.E Multi-Concepts, I''m interested in the {title} listed on your website. Is it still available?

Price: {price}
Listing: {url}'),
('whatsapp_template_default', 'Hello O.N.E Multi-Concepts, I''m interested in the {title}. Is it still available?

Price: {price}
Listing: {url}'),
('primary_color', '#DC2626'),
('currency', 'NGN'),
('currency_symbol', '₦'),
('listings_per_page', '12');
