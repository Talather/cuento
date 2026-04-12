import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNavigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking profile:', error);
        return;
      }

      if (!profile?.first_name || !profile?.last_name) {
        toast({
          title: "Complete su perfil",
          description: "Por favor complete su información personal para continuar.",
        });
        navigate("/profile");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.email || "Usuario");
        checkProfileCompletion(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.email || "Usuario");
        checkProfileCompletion(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setUserName("");
        navigate("/login");
        toast({
          title: "Sesión finalizada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        });
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUserName("");
      navigate("/login");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      setIsAuthenticated(false);
      setUserName("");
      navigate("/login");
      toast({
        title: "Información",
        description: "Se ha cerrado la sesión",
      });
    }
  };

  return {
    isAuthenticated,
    userName,
    showPricingModal,
    setShowPricingModal,
    handleLogout,
  };
};