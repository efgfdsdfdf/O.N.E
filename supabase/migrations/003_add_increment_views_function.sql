-- Increment listing view count from public listing detail pages.
-- The frontend dedupes repeated views from the same browser before calling this.

CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_id
    AND status IN ('published', 'sold');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

GRANT EXECUTE ON FUNCTION increment_views(UUID) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
