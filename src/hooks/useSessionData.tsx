
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAIL } from "@/utils/config";

export function useSessionData() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      const isAdmin = session?.user?.email === ADMIN_EMAIL;
      
      if (session && isAdmin && !session.user.app_metadata?.is_super_admin) {
        const { data } = await supabase.auth.updateUser({
          data: { is_super_admin: true }
        });
        
        const { data: { session: updatedSession } } = await supabase.auth.getSession();
        return updatedSession;
      }
      
      return session;
    },
  });
}
