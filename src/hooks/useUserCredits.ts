import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserCreditsResponse {
  credits: number;
  isAuthenticated: boolean;
}

export function useUserCredits() {
  return useQuery<UserCreditsResponse>({
    queryKey: ['user-credits'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuthenticated = !!session;

      if (!session) {
        return { credits: 1, isAuthenticated: false }; // Always return 1 credit for anonymous users
      }

      const { data, error } = await supabase.functions.invoke<{ credits: number }>(
        'get-user-credits',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      
      if (error) {
        console.error('Error fetching credits:', error);
        return { credits: 0, isAuthenticated: true }; // Return 0 credits on error for authenticated users
      }

      return { 
        credits: data?.credits ?? 0,
        isAuthenticated: true
      };
    },
  });
}