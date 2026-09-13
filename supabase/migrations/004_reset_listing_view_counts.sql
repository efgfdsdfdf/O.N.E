-- Reset inflated listing view totals after filtering automated visitors.

UPDATE listings
SET views_count = 0
WHERE views_count <> 0;

DELETE FROM analytics_events
WHERE event_type = 'listing_view';
