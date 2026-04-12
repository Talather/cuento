import { Card } from "@/components/ui/card";
import { StoryFeedbackForm } from "@/components/StoryFeedbackForm";
import { RelatedStories } from "@/components/RelatedStories";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PenLine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoryFeedbackSectionProps {
  storyId: string;
  storyTitle: string;
  tags?: string;
}

export function StoryFeedbackSection({ storyId, storyTitle, tags }: StoryFeedbackSectionProps) {
  const navigate = useNavigate();

  const { data: relatedStories, isLoading } = useQuery({
    queryKey: ['related-stories', storyId, tags],
    queryFn: async () => {
      if (!tags) return [];
      
      const tagArray = tags.split(',').map(tag => tag.trim());
      
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, image_url, cuentito_uid')
        .neq('id', storyId)
        .or(tagArray.map(tag => `tags.ilike.%${tag}%`).join(','))
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!tags
  });

  return (
    <>
      <div className="max-w-3xl mx-auto mt-8 text-center">
        <Button 
          className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto rounded-full"
          onClick={() => navigate("/story/new")}
        >
          <PenLine className="mr-2 h-5 w-5" />
          Escribir un nuevo Cuentito
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto mt-8 p-8 bg-white shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Comparte tu opinión</h2>
        <StoryFeedbackForm storyId={storyId} storyTitle={storyTitle} />
      </Card>

      {tags && (
        <div className="max-w-3xl mx-auto mt-8">
          <RelatedStories stories={relatedStories || []} isLoading={isLoading} />
        </div>
      )}
    </>
  );
}