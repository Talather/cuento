
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoryAudioPlayer } from "@/components/StoryAudioPlayer";
import { ADMIN_EMAIL } from "@/utils/config";

interface StoryContentHeaderProps {
  status?: string;
  featuredImageUrl?: string;
  title: string;
  prompt: string;
  synopsis?: string;
  isUppercase?: boolean;
  story: {
    id: string;
    user_id?: string;
    anonymous_user_id?: string;
    wordpress_user_id?: number;
    cuentito_uid?: number;
    created_at: string;
    updated_at: string;
    body: string;
  };
  isPaidUser?: boolean;
  onUpgradeClick?: () => void;
  onWordHighlight?: (index: number) => void;
}

export function StoryContentHeader({
  status,
  featuredImageUrl,
  title,
  prompt,
  synopsis,
  isUppercase = false,
  story,
  isPaidUser = false,
  onUpgradeClick,
  onWordHighlight
}: StoryContentHeaderProps) {
  const textStyle = isUppercase ? { textTransform: 'uppercase' as const } : undefined;

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const getFeaturedImageUrl = () => {
    return featuredImageUrl;
  };

  return (
    <>
      {status === 'flagged' && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This story has been flagged for review and is temporarily unpublished.
          </AlertDescription>
        </Alert>
      )}

      {getFeaturedImageUrl() && (
        <div className="mb-8">
          <img
            src={getFeaturedImageUrl()}
            alt={title}
            className="w-full h-auto rounded-lg shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {!isPaidUser && (
            <div className="mt-2 text-center p-2 bg-gray-100 rounded-md text-sm">
              Si quieres imágenes de mayor calidad e impacto, {' '}
              <button 
                onClick={onUpgradeClick}
                className="text-primary font-medium hover:underline focus:outline-none"
              >
                sube de nivel
              </button>
            </div>
          )}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4 text-left" style={textStyle}>{title}</h1>
      
      {session?.user && (
        <StoryAudioPlayer 
          storyId={story.id} 
          storyText={story.body} 
          onWordHighlight={onWordHighlight}
        />
      )}
      
      <div className="text-sm text-muted-foreground mb-6 text-left" style={textStyle}>
        Based on: {prompt}
      </div>

      {isAdmin && (
        <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm font-mono">
          <h3 className="font-semibold mb-2">Story Metadata</h3>
          <ul className="space-y-1">
            <li>Story ID: {story.id}</li>
            {story.user_id && <li>User ID: {story.user_id}</li>}
            {story.anonymous_user_id && <li>Anonymous User ID: {story.anonymous_user_id}</li>}
            {story.wordpress_user_id && <li>WordPress User ID: {story.wordpress_user_id}</li>}
            {story.cuentito_uid && <li>Cuentito UID: {story.cuentito_uid}</li>}
            <li>Created: {new Date(story.created_at).toLocaleString()}</li>
            <li>Updated: {new Date(story.updated_at).toLocaleString()}</li>
          </ul>
        </div>
      )}

      {synopsis && session?.user && (
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2" style={textStyle}>Synopsis</h2>
          <p className="text-muted-foreground" style={textStyle}>{synopsis}</p>
        </div>
      )}
    </>
  );
}
