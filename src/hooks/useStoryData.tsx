
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSlug } from "@/utils/slugUtils";

export function useStoryData(title?: string, id?: string) {
  return useQuery({
    queryKey: ['story', title, id],
    queryFn: async () => {
      if (!title) {
        throw new Error('Title is required');
      }

      const storySelect = `
        id,
        title,
        prompt,
        body,
        synopsis,
        tags,
        likes,
        image_url,
        created_at,
        updated_at,
        cuentito_uid,
        status,
        user_id,
        anonymous_user_id,
        wordpress_user_id,
        final_image_url,
        middle_images,
        story_likes (
          user_id
        )
      `;

      // If ID is provided, try to fetch by ID first
      if (id) {
        const { data: idStory, error: idError } = await supabase
          .from('stories')
          .select(storySelect)
          .eq('id', id)
          .single();

        if (!idError && idStory) {
          return idStory;
        }
      }

      // Try to find by wordpress_slug
      const { data: wpStory, error: wpError } = await supabase
        .from('stories')
        .select(storySelect)
        .eq('wordpress_slug', title)
        .single();

      if (!wpError && wpStory) {
        return wpStory;
      }

      // Finally, try to find by title
      const searchTitle = title.split('-').join(' ');
      
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select(storySelect);

      if (storiesError || !stories) {
        throw new Error('Failed to fetch stories');
      }

      const matchingStory = stories.find(story => 
        createSlug(story.title) === title
      );

      if (!matchingStory) {
        throw new Error('Story not found');
      }

      return matchingStory;
    },
    retry: false,
    enabled: Boolean(title),
  });
}
