import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoriesGrid } from "@/components/StoriesGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Story } from "@/types/story";
import { useTranslation } from "react-i18next";

export default function LikedStories() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: stories, isLoading } = useQuery({
    queryKey: ['liked-stories'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data: likedStories, error } = await supabase
        .from('story_likes')
        .select(`
          story_id,
          stories (
            id,
            title,
            synopsis,
            content,
            prompt,
            created_at,
            updated_at,
            likes,
            cuentito_uid,
            image_url
          )
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;
      
      // Map the data to match the Story type
      return likedStories.map(like => ({
        ...like.stories,
        content: like.stories.content || '',
        prompt: like.stories.prompt || '',
        updated_at: like.stories.updated_at || like.stories.created_at,
      })) as Story[];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('pages.liked_stories.title')}</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('pages.liked_stories.back')}
        </Button>
        <h1 className="text-2xl font-bold">{t('pages.liked_stories.title')}</h1>
      </div>
      
      {stories && stories.length > 0 ? (
        <StoriesGrid stories={stories} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('pages.liked_stories.no_stories')}</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/")}
          >
            {t('pages.liked_stories.explore')}
          </Button>
        </div>
      )}
    </div>
  );
}