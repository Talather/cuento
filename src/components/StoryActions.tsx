import { Button } from "@/components/ui/button";
import { Heart, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StoryActionsProps {
  publishDate: string;
  likesCount: number;
  onPrint?: () => void;
  onCreateNewStory?: () => void;
}

export const StoryActions = ({ 
  publishDate, 
  likesCount, 
  onPrint,
  onCreateNewStory 
}: StoryActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center mt-8 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4" />
        <span>{likesCount} {t('story.likes')}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{t('story.date')} {publishDate}</span>
        {onPrint && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={onPrint}
          >
            <Printer className="w-4 h-4" />
            <span>{t('story.print')}</span>
          </Button>
        )}
      </div>
    </div>
  );
};