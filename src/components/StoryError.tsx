import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { StoriesGrid } from "@/components/StoriesGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StoryErrorProps {
  error: unknown;
}

export function StoryError({ error }: StoryErrorProps) {
  const { data: stories, isLoading } = useQuery({
    queryKey: ['top-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, synopsis, body, likes, image_url, created_at')
        .eq('status', 'published')
        .order('likes', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-center">
          {error instanceof Error ? error.message : "The requested story could not be found."}
        </AlertDescription>
      </Alert>

      {!isLoading && stories && stories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Top Stories</h2>
          <StoriesGrid stories={stories} />
        </div>
      )}
    </div>
  );
}