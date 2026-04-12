import { StoryCard } from "@/components/StoryCard";
import { Story } from "@/types/story";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface StoriesGridProps {
  stories: Story[];
}

export const StoriesGrid = ({ stories }: StoriesGridProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-lg text-muted-foreground">
          {t("pages.my_stories.no_stories")}
        </p>
	<Button
            onClick={() => navigate("/story/new")}
            size="lg"
          >
            <BookOpen className="h-4 w-4" />
            {t("hero.button")}
          </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
};
