
-- Function to get event categories
CREATE OR REPLACE FUNCTION get_event_categories()
RETURNS TABLE (name text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT category FROM events
  WHERE category IS NOT NULL
  ORDER BY category;
END;
$$ LANGUAGE plpgsql;
