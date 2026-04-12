CREATE OR REPLACE FUNCTION public.handle_story_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  service_role_key text;
  response_status integer;
  response_body text;
BEGIN
  -- Initial debug log
  RAISE NOTICE 'handle_story_notification triggered for story ID: %, user ID: %', NEW.id, NEW.user_id;
  
  -- Only send notification for authenticated users
  IF NEW.user_id IS NOT NULL THEN
    -- Log the start of the function
    RAISE NOTICE 'Starting handle_story_notification for story: %, user: %', NEW.id, NEW.user_id;
    
    -- Get the service role key from the current environment
    BEGIN
      -- Try getting from app.settings first
      service_role_key := current_setting('app.settings.service_role_key', true);
      
      IF service_role_key IS NULL THEN
        -- Try getting from supabase.service_role_key
        service_role_key := current_setting('supabase.service_role_key', true);
      END IF;
      
      RAISE NOTICE 'Service role key status: %', 
        CASE 
          WHEN service_role_key IS NOT NULL THEN 'Found'
          ELSE 'Not found'
        END;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error getting service_role_key: %', SQLERRM;
      RETURN NEW;
    END;
    
    -- Log before making the HTTP request
    RAISE NOTICE 'Attempting to call edge function with story ID: % and user ID: %', NEW.id, NEW.user_id;
    
    -- Call the edge function using http_request with explicit URL
    BEGIN
      SELECT
        status,
        content::text
      INTO
        response_status,
        response_body
      FROM
        http((
          'POST',
          'https://' || current_setting('app.settings.project_ref') || '.supabase.co/functions/v1/send-story-notification',
          ARRAY[
            ('Content-Type', 'application/json'),
            ('Authorization', 'Bearer ' || service_role_key)
          ],
          'application/json',
          jsonb_build_object(
            'storyId', NEW.id,
            'userId', NEW.user_id,
            'storyTitle', NEW.title,
            'storyUrl', ''
          )::text
        ));
      
      -- Log the response
      RAISE NOTICE 'Edge function response - Status: %, Body: %', response_status, response_body;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error calling edge function: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Skipping notification for anonymous user story: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors
  RAISE WARNING 'Error in handle_story_notification: %', SQLERRM;
  RETURN NEW;
END;
$function$;