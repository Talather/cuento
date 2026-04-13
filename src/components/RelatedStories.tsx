import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { createSlug } from "@/utils/slugUtils";
import { getStoryFeaturedImage, PLACEHOLDER_IMAGE } from "@/utils/config";

interface Story {
  id: string;
  title: string;
  image_url?: string;
  cuentito_uid?: number;
}

interface RelatedStoriesProps {
  stories: Story[];
  isLoading: boolean;
}

export function RelatedStories({ stories, isLoading }: RelatedStoriesProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const handleStoryClick = (storyTitle: string, storyId: string) => {
    window.scrollTo(0, 0);
    navigate(`/story/${createSlug(storyTitle)}/${storyId}`);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stories?.length) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{t('story.related')}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {stories.map((story) => {
          const featuredImageUrl = getStoryFeaturedImage(story);

          return (
            <Card 
              key={story.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStoryClick(story.title, story.id)}
            >
              {featuredImageUrl ? (
                <img
                  src={featuredImageUrl}
                  alt={story.title}
                  className="w-full h-48 object-cover mb-4 rounded"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-48 rounded mb-4 bg-gradient-to-br from-violet-600 to-purple-400 flex items-center justify-center">
                  <span className="text-5xl">📖</span>
                </div>
              )}
              <h3 className="font-semibold line-clamp-2">{story.title}</h3>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
