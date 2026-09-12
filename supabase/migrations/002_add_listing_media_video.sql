-- Add video support to listing media.
-- Existing rows are treated as images.

ALTER TABLE listing_images
ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';

ALTER TABLE listing_images
DROP CONSTRAINT IF EXISTS listing_images_media_type_check;

ALTER TABLE listing_images
ADD CONSTRAINT listing_images_media_type_check
CHECK (media_type IN ('image', 'video'));

NOTIFY pgrst, 'reload schema';
