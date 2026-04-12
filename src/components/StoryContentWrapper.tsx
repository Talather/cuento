
import { StoryContainer } from "@/components/StoryContainer";
import { StorySidebar } from "@/components/StorySidebar";
import { AdSlot } from "@/components/AdSlot";

interface StoryContentWrapperProps {
  story: {
    id: string;
    title: string;
    prompt: string;
    body: string;
    synopsis?: string;
    tags?: string;
    likes: number;
    image_url?: string;
    cuentito_uid?: number;
    status?: string;
    user_id?: string;
    anonymous_user_id?: string;
    wordpress_user_id?: number;
    created_at: string;
    updated_at: string;
    final_image_url?: string;
    middle_images?: string[] | null;
  };
  publishDate: string;
  isLiked: boolean;
  onLikeClick: () => void;
  isUppercase: boolean;
  onUppercaseToggle: () => void;
  currentUrl: string;
}

export function StoryContentWrapper({
  story,
  publishDate,
  isLiked,
  onLikeClick,
  isUppercase,
  onUppercaseToggle,
  currentUrl,
}: StoryContentWrapperProps) {
  return (
    <div className="container mx-auto py-8 flex-1">
      <div className="relative flex justify-center">
        <StoryContainer
          story={story}
          publishDate={publishDate}
          isUppercase={isUppercase}
        />
        
        <div className="fixed right-0 top-[200px] h-[300px] bg-white shadow-lg">
          <StorySidebar
            isUppercase={isUppercase}
            onUppercaseToggle={onUppercaseToggle}
            storyTitle={story.title}
            storyUrl={currentUrl}
            storyPrompt={story.prompt}
            storyId={story.id}
            isLiked={isLiked}
            onLikeClick={onLikeClick}
          />
        </div>
      </div>
      
      {/* Ad after story content */}
      <div className="max-w-3xl mx-auto mt-8">
        <AdSlot format="auto" className="my-8" />
      </div>
    </div>
  );
}
