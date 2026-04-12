
import { Card } from "@/components/ui/card";
import { StoryActions } from "@/components/StoryActions";
import { StoryContentHeader } from "@/components/StoryContentHeader";
import { StoryContentBody } from "@/components/StoryContentBody";
import { StoryTags } from "@/components/StoryTags";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTiersModal } from "@/components/SubscriptionTiersModal";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsPayingUser } from "@/hooks/useIsPayingUser";
import { getStoryFeaturedImage } from "@/utils/config";

interface StoryContentProps {
  story: {
    id: string;
    image_url?: string;
    title: string;
    prompt: string;
    synopsis?: string;
    body: string;
    tags?: string;
    likes: number;
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
  isUppercase?: boolean;
}

export function StoryContent({ story, publishDate, isUppercase = false }: StoryContentProps) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentHighlightedWord, setCurrentHighlightedWord] = useState(-1);
  const { toast } = useToast();
  const { data: isPaidUser, isLoading: isLoadingPaidStatus } = useIsPayingUser();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userSubscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const originalPrint = window.print;
    let isPrinting = false;

    const preventPrintAndShowModal = (e?: Event) => {
      if (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      
      if (!isPrinting && (!session?.user || !userSubscription)) {
        isPrinting = true;
        toast({
          title: "Registrate para continuar",
          description: "Para imprimir Cuentitos tenés que registrarte.",
          variant: "destructive",
        });
        setShowPricingModal(true);
        setTimeout(() => {
          isPrinting = false;
        }, 100);
        return false;
      }
      return true;
    };

    window.print = () => {
      if (preventPrintAndShowModal()) {
        originalPrint();
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        preventPrintAndShowModal(e);
      }
    };

    const handleBeforePrint = (e: Event) => {
      preventPrintAndShowModal(e);
    };

    document.addEventListener('keydown', handleKeyPress, { capture: true });
    window.addEventListener('beforeprint', handleBeforePrint, { capture: true });
    window.addEventListener('print', handleBeforePrint, { capture: true });

    return () => {
      window.print = originalPrint;
      document.removeEventListener('keydown', handleKeyPress, { capture: true });
      window.removeEventListener('beforeprint', handleBeforePrint, { capture: true });
      window.removeEventListener('print', handleBeforePrint, { capture: true });
    };
  }, [session?.user, userSubscription, toast]);

  const handlePrint = () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in and become a paying member to print stories.",
        variant: "destructive",
      });
      setShowPricingModal(true);
      return;
    }
    
    if (!userSubscription) {
      toast({
        title: "Subscription required",
        description: "Please upgrade to a paid plan to print stories.",
        variant: "destructive",
      });
      setShowPricingModal(true);
      return;
    }
    
    window.print();
  };

  const featuredImageUrl = getStoryFeaturedImage(story);

  const middleImages = story.middle_images || (story.image_url ? [story.image_url] : []);

  const finalImageUrl = story.final_image_url || null;

  const handleUpgradeClick = () => {
    setShowPricingModal(true);
  };

  const handleWordHighlight = (index: number) => {
    setCurrentHighlightedWord(index);
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto p-8 bg-white shadow-xl">
        <div className="prose prose-sm sm:prose lg:prose-lg mx-auto">
          <StoryContentHeader
            status={story.status}
            featuredImageUrl={featuredImageUrl}
            title={story.title}
            prompt={story.prompt}
            synopsis={story.synopsis}
            isUppercase={isUppercase}
            story={story}
            isPaidUser={!!isPaidUser}
            onUpgradeClick={handleUpgradeClick}
            onWordHighlight={handleWordHighlight}
          />

          <StoryContentBody
            body={story.body}
            middleImages={middleImages}
            finalImageUrl={finalImageUrl}
            isUppercase={isUppercase}
            status={story.status}
            cuentito_uid={story.cuentito_uid}
            featuredImageUrl={featuredImageUrl}
            middle_images={story.middle_images}
            isPaidUser={!!isPaidUser}
            onUpgradeClick={handleUpgradeClick}
            currentHighlightedWord={currentHighlightedWord}
          />

          <StoryTags
            tags={story.tags}
            isUppercase={isUppercase}
          />

          <StoryActions
            publishDate={publishDate}
            likesCount={story.likes}
            onPrint={handlePrint}
          />
        </div>
      </Card>

      <SubscriptionTiersModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
      />
    </>
  );
}
