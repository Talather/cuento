import { supabase } from "@/integrations/supabase/client";

export const getValidSession = async () => {
  // Get a fresh session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    return null;
  }

  if (!session?.access_token) {
    console.error('No valid session found');
    return null;
  }

  // Attempt to refresh the session if needed
  const { data: { session: refreshedSession }, error: refreshError } = 
    await supabase.auth.refreshSession();

  if (refreshError) {
    console.error('Error refreshing session:', refreshError);
    return session;
  }

  return refreshedSession || session;
};