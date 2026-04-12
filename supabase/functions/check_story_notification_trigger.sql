-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_story_created_send_notification ON stories;

-- Create the trigger
CREATE TRIGGER on_story_created_send_notification
  AFTER INSERT
  ON stories
  FOR EACH ROW
  EXECUTE FUNCTION handle_story_notification();

-- Verify trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_story_created_send_notification';