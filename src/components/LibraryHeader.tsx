import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LibraryHeaderProps {
  currentSort: string;
  onSortChange: (value: string) => void;
}

export const LibraryHeader = ({ currentSort, onSortChange }: LibraryHeaderProps) => {
  const { t } = useTranslation();
  const session = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const showUserStories = searchParams.get("filter") === "my-stories";

  const sortOptions = [
    { value: "likes-desc", label: t('library.sort.most_liked') },
    { value: "date-desc", label: t('library.sort.newest') },
    { value: "date-asc", label: t('library.sort.oldest') },
  ];

  const toggleFilter = () => {
    setSearchParams((params) => {
      if (showUserStories) {
        params.delete("filter");
      } else {
        params.set("filter", "my-stories");
      }
      params.set("page", "1");
      return params;
    });
  };

  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          {t('nav.library')}
        </h1>
        <div className="flex items-center gap-4">
          {session?.user && (
            <Button
              variant={showUserStories ? "default" : "outline"}
              onClick={toggleFilter}
            >
              {showUserStories ? t('library.show_all') : t('library.show_mine')}
            </Button>
          )}
          <Select value={currentSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder={t('library.sort.placeholder')} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-lg text-muted-foreground text-left">
        {t('library.subtitle')}
      </p>
    </div>
  );
};
