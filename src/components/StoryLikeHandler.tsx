import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { useStoryLikes } from "@/hooks/useStoryLikes";

interface StoryLikeHandlerProps {
  storyId: string;
  title?: string;
  session: Session | null;
  storyLikes: Array<{ user_id: string }>;
  children: (props: {
    isLiked: boolean;
    handleLikeClick: () => void;
  }) => React.ReactNode;
}

export function StoryLikeHandler({ 
  storyId, 
  title, 
  session, 
  storyLikes,
  children 
}: StoryLikeHandlerProps) {
  const { toast } = useToast();
  const { likeMutation, unlikeMutation } = useStoryLikes(storyId, title);

  const isLiked = storyLikes?.some(like => like.user_id === session?.user?.id);

  const handleLikeClick = () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like stories.",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      unlikeMutation.mutate(session.user.id);
    } else {
      likeMutation.mutate(session.user.id);
    }
  };

  return children({ isLiked, handleLikeClick });
}