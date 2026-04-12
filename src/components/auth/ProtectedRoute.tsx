import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const anonymousSessionId = useAnonymousSession();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session || !!anonymousSessionId);
    });
  }, [anonymousSessionId]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !anonymousSessionId) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};