
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { StoryHeader } from "@/components/StoryHeader";
import { StoryLoadingState } from "@/components/StoryLoadingState";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useStoryData } from "@/hooks/useStoryData";
import { StoryContentWrapper } from "@/components/StoryContentWrapper";
import { RegistrationModal } from "@/components/RegistrationModal";
import { createSlug } from "@/utils/slugUtils";
import { StoryError } from "@/components/StoryError";
import { useSessionData } from "@/hooks/useSessionData";
import { StoryLikeHandler } from "@/components/StoryLikeHandler";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet";
import { getStoryFeaturedImage, DEFAULT_OG_IMAGE, PLACEHOLDER_IMAGE } from "@/utils/config";

export default function Story() {
  const { title, id } = useParams<{ title: string; id?: string }>();
  const navigate = useNavigate();
  const [isUppercase, setIsUppercase] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const location = useLocation();

  const { data: session } = useSessionData();

  const { 
    data: story, 
    isLoading, 
    error,
    isError 
  } = useStoryData(title, id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoading && story && !id) {
      const fullPath = `/story/${createSlug(story.title)}/${story.id}`;
      if (location.pathname !== fullPath) {
        navigate(fullPath, { replace: true });
      }
    }
  }, [story, isLoading, id, navigate, location.pathname]);

  useEffect(() => {
    const isNewlyCreatedStory = location.state?.isNewStory;
    if (!session?.user && !isLoading && story && isNewlyCreatedStory) {
      const timer = setTimeout(() => {
        setShowRegistrationModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session?.user, isLoading, story, location.state]);

  useEffect(() => {
    if (story?.title) {
      document.title = `Cuenti.to | ${story.title}`;
    }
    return () => {
      document.title = "Cuenti.to | Cuentos escritos por vos junto a una IA";
    };
  }, [story?.title]);

  if (isLoading) {
    return <StoryLoadingState />;
  }

  if (isError || !story) {
    return <StoryError error={error} />;
  }

  const publishDate = format(new Date(story.created_at), 'MM/dd/yyyy');
  const canonicalUrl = `https://cuenti.to/story/${createSlug(story.title)}/${story.id}`;
  const featuredImageUrl = getStoryFeaturedImage(story) || DEFAULT_OG_IMAGE;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <SEO 
          title={story.title}
          description={story.synopsis || `Lee "${story.title}" en Cuenti.to`}
          image={featuredImageUrl}
          url={canonicalUrl}
        />
      </Helmet>

      <StoryHeader />

      <SidebarProvider defaultOpen>
        <StoryLikeHandler
          storyId={story.id}
          title={title}
          session={session}
          storyLikes={story.story_likes}
        >
          {({ isLiked, handleLikeClick }) => (
            <StoryContentWrapper
              story={story}
              publishDate={publishDate}
              isLiked={isLiked}
              onLikeClick={handleLikeClick}
              isUppercase={isUppercase}
              onUppercaseToggle={() => setIsUppercase(!isUppercase)}
              currentUrl={canonicalUrl}
            />
          )}
        </StoryLikeHandler>
      </SidebarProvider>

      <RegistrationModal
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
      />
    </div>
  );
}
