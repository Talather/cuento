import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousSession } from "./useAnonymousSession";

export const useAnonymousUserStories = () => {
  const anonymousSessionId = useAnonymousSession();
  
  const { data: anonymousUser } = useQuery({
    queryKey: ['anonymous-user', anonymousSessionId],
    queryFn: async () => {
      if (!anonymousSessionId) return null;
      
      // Get or create a single anonymous user for the session
      const { data: existingUser, error: fetchError } = await supabase
        .from('anonymous_users')
        .select('*')
        .eq('session_id', anonymousSessionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingUser) {
        return existingUser;
      }

      // Create new anonymous user if none exists
      const { data: newUser, error: createError } = await supabase
        .from('anonymous_users')
        .insert([{ 
          session_id: anonymousSessionId, 
          stories_created: 0 
        }])
        .select()
        .single();
        
      if (createError) throw createError;
      return newUser;
    },
    enabled: !!anonymousSessionId,
  });

  const checkStoryLimit = async (userId: string) => {
    // console.log('Checking story limit for anonymous user:', userId);
    
    const { data: stories, error, count } = await supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .eq('anonymous_user_id', userId);

    if (error) {
      // console.error('Error checking story limit:', error);
      throw error;
    }

    const hasReachedLimit = count >= 1;
    // console.log('Anonymous user story count:', count, 'Has reached limit:', hasReachedLimit);
    
    return hasReachedLimit;
  };

  return {
    anonymousUser,
    checkStoryLimit
  };
};
