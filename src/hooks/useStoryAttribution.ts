import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStoryAttribution = (
  onOpenChange: (open: boolean) => void,
  storyId: string | undefined
) => {
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('Auth state changed:', event, 'Session:', session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Get the pending story ID from localStorage
          const pendingStoryId = localStorage.getItem('pendingStoryAttribution');
          // console.log('Retrieved pending story ID:', pendingStoryId);
          
          if (!pendingStoryId) {
            // console.log('No pending story ID found in localStorage');
            return;
          }

          // First, verify the story exists and is not already attributed
          const { data: story, error: fetchError } = await supabase
            .from('stories')
            .select('user_id, anonymous_user_id')
            .eq('id', pendingStoryId)
            .single();

          if (fetchError) {
            // console.error('Error fetching story:', fetchError);
            throw fetchError;
          }

          // console.log('Current story state:', story);

          // Only update if the story is not already attributed to a user
          if (!story.user_id) {
            const { data: updatedStory, error: updateError } = await supabase
              .from('stories')
              .update({
                user_id: session.user.id,
                anonymous_user_id: null
              })
              .eq('id', pendingStoryId)
              .select()
              .single();

            if (updateError) {
              // console.error('Error updating story:', updateError);
              throw updateError;
            }

            // console.log('Story attributed successfully:', updatedStory);

            toast({
              title: "Story attributed",
              description: "This story has been added to your collection.",
            });
          } else {
            // console.log('Story already has a user_id, skipping attribution');
          }

          // Clear the pending story ID
          localStorage.removeItem('pendingStoryAttribution');

          // Close the modal
          onOpenChange(false);

        } catch (error) {
          // console.error('Error attributing story:', error);
          toast({
            title: "Attribution failed",
            description: "Unable to attribute the story to your account. Please try again.",
            variant: "destructive",
          });
          localStorage.removeItem('pendingStoryAttribution');
        }
      }
    });

    // Check if there's a story ID in localStorage on mount
    const pendingStoryId = localStorage.getItem('pendingStoryAttribution');
    if (pendingStoryId) {
      // console.log('Found pending story ID on mount:', pendingStoryId);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [onOpenChange, toast]);
};
