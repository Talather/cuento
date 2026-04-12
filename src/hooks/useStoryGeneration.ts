
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createSlug } from "@/utils/slugUtils";
import { cleanStoryContent, parseStoryResponse } from "@/utils/storyContent";
import { handleLimitCheck } from "@/utils/storyLimits";
import { sendStoryEmail } from "@/utils/emailUtils";
import { useTranslation } from "react-i18next";
import { ImageGenerationService } from "@/services/ImageGenerationService";

interface StoryGenerationConfig {
  onSuccess?: (slug: string, id: string) => void;
}

export const useStoryGeneration = (
  user: any, 
  anonymousUser: any, 
  config?: StoryGenerationConfig
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const imageService = new ImageGenerationService();

  const generateStory = async (prompt: string) => {
    const hasReachedLimit = await handleLimitCheck(user, anonymousUser, {
      title: t('story.error_limit_title'),
      description: t('story.error_limit_body')
    });
    
    if (hasReachedLimit) return;

    setIsGenerating(true);

    try {
      const { data: storyResponse, error: generationError } = await supabase.functions.invoke('generate-story', {
        body: { prompt }
      });

      if (generationError) throw generationError;

      const storyData = parseStoryResponse(storyResponse);
      const cleanedContent = cleanStoryContent(storyData.content);

      let numberOfImages = 1;
      let imagePrompts = [storyData.image_prompts.featured];

      if (user) {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscription) {
          numberOfImages = 3;
          imagePrompts = [
            storyData.image_prompts.featured,
            storyData.image_prompts.middle1,
            storyData.image_prompts.middle2
          ];
        } else {
          numberOfImages = 2;
          imagePrompts = [
            storyData.image_prompts.featured,
            storyData.image_prompts.middle1
          ];
        }
      }

      // Generate images using the appropriate service based on subscription status
      const generatedImages = await Promise.all(
        imagePrompts.map(prompt => 
           imageService.generateImage(prompt)
        )
      );

      // Extract all image URLs and ensure they're valid
      const featuredImage = generatedImages[0];
      const middleImages = generatedImages.slice(1).filter(Boolean);
      
      // Join middle images with comma, but only include valid URLs
      const combinedMiddleImages = middleImages.length > 0 ? middleImages.join(',') : null;

      // console.log('Generated images:', {
      //  featuredImage,
      //  middleImages,
      //  combinedMiddleImages
      // });

      const { data: story, error: saveError } = await supabase
        .from('stories')
        .insert({
          prompt,
          title: storyData.title,
          content: storyData.content,
          body: cleanedContent,
          raw_response: typeof storyResponse === 'string' ? storyResponse : JSON.stringify(storyResponse),
          user_id: user ? user.id : null,
          anonymous_user_id: !user && anonymousUser ? anonymousUser.id : null,
          image_url: featuredImage,
          image_prompt: storyData.image_prompts.featured,
          image_prompt1: storyData.image_prompts.middle1,
          image_prompt2: storyData.image_prompts.middle2,
          synopsis: storyData.synopsis,
          tags: storyData.tags.join(', '),
          final_image_url: combinedMiddleImages,
          middle_images: middleImages // Add this new field to store middle images array
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving story:', saveError);
        throw new Error('Failed to save the story. Please try again.');
      }

      if (user?.id && user?.email) {
        await sendStoryEmail(story.id, user.id, user.email);
      }

      const slug = createSlug(story.title);
      navigate(`/story/${slug}/${story.id}`);
      
      config?.onSuccess?.(slug, story.id);
    } catch (error) {
      console.error('Error in generateStory:', error);
      toast({
        title: t('story.error_generating_title'),
        description: t('story.error_generating_body'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateStory, isGenerating };
};
