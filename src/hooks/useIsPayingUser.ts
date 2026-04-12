import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIsPayingUser = () => {
  return useQuery({
    queryKey: ['is-paying-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Anonymous users are not paying
      if (!session?.user) {
        return false;
      }

      // Check for active subscriptions
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .limit(1);

      return subscriptions?.length > 0;
    },
    // Cache the result for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
};