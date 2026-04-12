import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStoryLikes(storyId?: string, slug?: string) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!storyId) throw new Error("Story ID is required");

      // Insert the like
      const { error: insertError } = await supabase
        .from('story_likes')
        .insert([{ story_id: storyId, user_id: userId }]);

      if (insertError) throw insertError;

      // Update the likes count
      const { data, error: updateError } = await supabase
        .rpc('increment_likes', { row_id: storyId });

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story', slug] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!storyId) throw new Error("Story ID is required");

      // Delete the like
      const { error: deleteError } = await supabase
        .from('story_likes')
        .delete()
        .eq('story_id', storyId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Update the likes count
      const { data, error: updateError } = await supabase
        .rpc('decrement_likes', { row_id: storyId });

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story', slug] });
    },
  });

  return {
    likeMutation,
    unlikeMutation,
  };
}