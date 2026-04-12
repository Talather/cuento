
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function generateStory(supabase: any, prompt: string) {
  const { data: storyResponse, error: generationError } = await supabase.functions.invoke('generate-story', {
    body: { prompt }
  });

  if (generationError) throw generationError;

  const { data: story, error: saveError } = await supabase
    .from('stories')
    .insert({
      prompt,
      title: storyResponse.title,
      content: storyResponse.content,
      body: storyResponse.content,
      synopsis: storyResponse.synopsis,
      tags: storyResponse.tags.join(', '),
      image_prompt: storyResponse.image_prompts.featured
    })
    .select()
    .single();

  if (saveError) throw saveError;

  // Generate image - always use Gemini for WhatsApp webhook since these are likely not paying users
  const { data: imageResponse } = await supabase.functions.invoke('generate-image', {
    body: {
      prompt: storyResponse.image_prompts.featured,
      requestId: crypto.randomUUID(),
       timestamp: Date.now()
    }
  });

  if (imageResponse?.imageURL) {
    await supabase
      .from('stories')
      .update({ image_url: imageResponse.imageURL })
      .eq('id', story.id);
  }

  return { ...story, image_url: imageResponse?.imageURL };
}
