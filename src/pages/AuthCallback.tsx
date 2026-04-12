import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePendingSubscription } from "@/hooks/usePendingSubscription";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handlePendingSubscription } = usePendingSubscription();

  useEffect(() => {
    const checkProfileCompletion = async (session: any) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        // Check if essential profile fields are missing
        if (!profile?.first_name || !profile?.last_name) {
          toast({
            title: "Complete su perfil",
            description: "Por favor complete su información personal para continuar.",
          });
          return true; // Profile needs completion
        }
        return false; // Profile is complete
      } catch (error) {
        console.error('Error checking profile:', error);
        return true; // Redirect to profile on error to be safe
      }
    };

    const handleStoryAttribution = async (session: any) => {
      try {
        const pendingStoryId = localStorage.getItem('pendingStoryAttribution');
        
        if (!pendingStoryId) {
          return;
        }
        
        const { data: story, error: fetchError } = await supabase
          .from('stories')
          .select('user_id, anonymous_user_id')
          .eq('id', pendingStoryId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        const { error: updateError } = await supabase
          .from('stories')
          .update({
            user_id: session.user.id,
            anonymous_user_id: null
          })
          .eq('id', pendingStoryId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "Story attributed",
          description: "This story has been added to your collection.",
        });

        localStorage.removeItem('pendingStoryAttribution');

      } catch (error) {
        toast({
          title: "Attribution failed",
          description: "Unable to attribute the story to your account. Please try again.",
          variant: "destructive",
        });
        localStorage.removeItem('pendingStoryAttribution');
      }
    };

    const handleAuth = async (session: any) => {
      if (session) {
        await handleStoryAttribution(session);
        
        const needsProfileCompletion = await checkProfileCompletion(session);
        
        const pendingData = localStorage.getItem('pendingSubscription');
        if (pendingData) {
          await handlePendingSubscription(session);
          localStorage.removeItem('pendingSubscription');
        } else if (needsProfileCompletion) {
          navigate("/profile");
        } else {
          navigate("/");
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuth(session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleAuth(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, handlePendingSubscription]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;