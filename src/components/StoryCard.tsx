import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { createSlug } from "@/utils/slugUtils";
import { Story } from "@/types/story";
import { getStoryFeaturedImage, PLACEHOLDER_IMAGE } from "@/utils/config";

interface StoryCardProps {
  story: Story;
}

export const StoryCard = ({ story }: StoryCardProps) => {
  const navigate = useNavigate();
  const featuredImageUrl = getStoryFeaturedImage(story);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/story/${createSlug(story.title)}/${story.id}`)}
    >
      {featuredImageUrl ? (
        <img
          src={featuredImageUrl}
          alt={story.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-48 rounded-lg mb-4 bg-gradient-to-br from-violet-600 to-purple-400 flex items-center justify-center">
          <span className="text-5xl">📖</span>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2 line-clamp-1">{story.title}</h2>
      {story.synopsis && (
        <p className="text-muted-foreground mb-4 line-clamp-2 text-left">
          {story.synopsis}
        </p>
      )}
      <div className="flex items-center justify-end text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          {story.likes || 0} likes
        </div>
      </div>
    </Card>
  );
};
