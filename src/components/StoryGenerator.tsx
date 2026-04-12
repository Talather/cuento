import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoryPromptForm } from "./StoryPromptForm";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { useAnonymousUserStories } from "@/hooks/useAnonymousUserStories";
import { RegistrationModal } from "./RegistrationModal";
import { SubscriptionTiersModal } from "./SubscriptionTiersModal";
import { useToast } from "@/components/ui/use-toast";

export const StoryGenerator = () => {
  const [user, setUser] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { anonymousUser, checkStoryLimit } = useAnonymousUserStories();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // console.log('Initial session:', session?.user?.id || 'No session');
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // console.log('Auth state changed:', _event, session?.user?.id);
      setUser(session?.user ?? null);
      if (session) {
        setShowLimitModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGenerateStory = async (prompt: string) => {
    // console.log('Handling story generation. User:', user?.id, 'Anonymous user:', anonymousUser?.id);
    
    try {
      if (!user) {
        // console.log('No authenticated user, proceeding with anonymous story generation');
        generateStory(prompt);
      } else {
        // console.log('Checking credits for authenticated user:', user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('story_credits')
          .eq('id', user.id)
          .single();
        
        if (profile && profile.story_credits <= 0) {
          // console.log('User has no credits remaining');
          setShowSubscriptionModal(true);
          return;
        }
        // console.log('User has credits, generating story');
        generateStory(prompt);
      }
    } catch (error) {
      // console.error('Error in handleGenerateStory:', error);
      toast({
        title: "Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { generateStory, isGenerating } = useStoryGeneration(user, anonymousUser, {
    onSuccess: (slug: string, id: string) => {
      if (!user) {
        navigate(`/story/${slug}/${id}`, { state: { isNewStory: true } });
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <StoryPromptForm 
          onSubmit={handleGenerateStory} 
          isLoading={isGenerating} 
        />
      </div>

      <RegistrationModal 
        open={showLimitModal} 
        onOpenChange={setShowLimitModal} 
      />

      <SubscriptionTiersModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />
    </div>
  );
};
