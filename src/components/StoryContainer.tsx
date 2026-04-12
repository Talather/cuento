
import { StoryContent } from "@/components/StoryContent";
import { StoryFeedbackSection } from "@/components/StoryFeedbackSection";

interface StoryContainerProps {
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
  isUppercase: boolean;
}

export function StoryContainer({ 
  story, 
  publishDate,
  isUppercase 
}: StoryContainerProps) {
  return (
    <div className="w-[800px]">
      <StoryContent
        story={story}
        publishDate={publishDate}
        isUppercase={isUppercase}
      />

      <StoryFeedbackSection
        storyId={story.id}
        storyTitle={story.title}
        tags={story.tags}
      />
    </div>
  );
}
