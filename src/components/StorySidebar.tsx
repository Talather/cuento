import { Type, Share2, Wand2, Flag, Heart, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoryShareModal } from "@/components/StoryShareModal";
import { StoryFlagModal } from "@/components/StoryFlagModal";

interface StorySidebarProps {
  isUppercase: boolean;
  onUppercaseToggle: () => void;
  storyTitle: string;
  storyUrl: string;
  storyPrompt: string;
  storyId: string;
  isLiked: boolean;
  onLikeClick: () => void;
}

export function StorySidebar({
  isUppercase,
  onUppercaseToggle,
  storyTitle,
  storyUrl,
  storyPrompt,
  storyId,
  isLiked,
  onLikeClick,
}: StorySidebarProps) {
  const navigate = useNavigate();

  const handleRemix = () => {
    navigate('/story/new', { state: { prompt: storyPrompt } });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-[60px] h-full flex flex-col items-center gap-4 py-4 bg-white">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onUppercaseToggle}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                isUppercase ? "bg-gray-100" : ""
              }`}
            >
              <Type className="h-4 w-4" />
              <span className="sr-only">Toggle Uppercase</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Toggle Uppercase
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <StoryShareModal
        storyTitle={storyTitle}
        storyUrl={storyUrl}
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleRemix}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Wand2 className="h-4 w-4" />
              <span className="sr-only">Remix Story</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Remix Story</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handlePrint}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span className="sr-only">Print Story</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Print to PDF
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onLikeClick}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span className="sr-only">Like Story</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isLiked ? "Unlike Story" : "Like Story"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <StoryFlagModal
        storyId={storyId}
        storyTitle={storyTitle}
      />
    </div>
  );
}