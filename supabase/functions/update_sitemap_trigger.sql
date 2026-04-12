-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_sitemap_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Make HTTP request to our edge function
  PERFORM
    net.http_post(
      url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/update-sitemap'),
      headers := jsonb_build_object(
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key')),
        'Content-Type', 'application/json'
      ),
      body := '{}'
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_story_update_sitemap ON stories;
CREATE TRIGGER on_story_update_sitemap
  AFTER INSERT OR UPDATE OR DELETE
  ON stories
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.handle_sitemap_update();