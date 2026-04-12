import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createSlug } from "@/utils/slugUtils";

export const StoryHistory = () => {
  const navigate = useNavigate();

  const { data: stories, isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Stories</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stories?.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Stories</h2>
        <Card className="p-6">
          <p className="text-muted-foreground">No stories yet. Create your first one!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Stories</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <Card key={story.id} className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-2 line-clamp-1">{story.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {story.prompt}
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/story/${createSlug(story.title)}/${story.id}`)}
              className="w-full"
            >
              Read Story
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};