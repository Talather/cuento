CREATE OR REPLACE FUNCTION handle_sitemap_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Make the HTTP request to the Edge Function using the public API key
  PERFORM
    net.http_post(
      -- ⚠️ Replace with your actual Supabase URL before running migrations
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/update-sitemap',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('supabase.anon_key', true),
        'Content-Type', 'application/json'
      ),
      body := '{}'
    );
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to update sitemap: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Create or replace the trigger
CREATE OR REPLACE TRIGGER update_sitemap_trigger
AFTER INSERT OR UPDATE OR DELETE ON stories
FOR EACH ROW
EXECUTE FUNCTION handle_sitemap_update();