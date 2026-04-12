import { useNavigate } from "react-router-dom";
import { useSessionData } from "@/hooks/useSessionData";
import { createSlug } from "@/utils/slugUtils";

interface StoryTagsProps {
  tags?: string;
  isUppercase?: boolean;
}

export function StoryTags({ tags, isUppercase = false }: StoryTagsProps) {
  const { data: session } = useSessionData();
  const navigate = useNavigate();

  if (!tags || !session?.user) return null;

  const textStyle = isUppercase ? { textTransform: 'uppercase' as const } : undefined;

  const handleTagClick = (tag: string) => {
    navigate(`/tagged/${createSlug(tag)}`);
  };

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {tags.split(',').map((tag, index) => (
        <button
          key={index}
          onClick={() => handleTagClick(tag.trim())}
          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/20 transition-colors"
          style={textStyle}
        >
          {tag.trim()}
        </button>
      ))}
    </div>
  );
}