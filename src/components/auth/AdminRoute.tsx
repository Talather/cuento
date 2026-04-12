import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ADMIN_EMAIL } from "@/utils/config";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const { data: hasAdminRole, error } = await supabase
          .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
        
        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(session.user.email === ADMIN_EMAIL);
        } else {
          setIsAdmin(hasAdminRole === true);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in admin check:", err);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: hasAdminRole, error } = await supabase
          .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
        
        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(session.user.email === ADMIN_EMAIL);
        } else {
          setIsAdmin(hasAdminRole === true);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
