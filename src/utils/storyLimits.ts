import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const checkMonthlyLimit = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('story_credits')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking story credits:', error);
    return true; // Fail safe: prevent generation if we can't check the limit
  }

  return profile.story_credits <= 0;
};

export const checkAnonymousUserLimit = async (anonymousUserId: string) => {
  try {
    const { count, error } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .eq('anonymous_user_id', anonymousUserId)
      .limit(1)
      .single();

    if (error) {
      console.error('Error checking story limit:', error);
      return false;
    }

    return count && count >= 1;
  } catch (error) {
    console.error('Error in checkAnonymousUserLimit:', error);
    return false;
  }
};

export const handleLimitCheck = async (
  user: any, 
  anonymousUser: any,
  translations: { 
    title: string;
    description: string;
  }
) => {
  try {
    if (user?.id) {
      const hasReachedLimit = await checkMonthlyLimit(user.id);
      if (hasReachedLimit) {
        toast({
          title: translations.title,
          description: translations.description,
          variant: "destructive",
        });
        return true;
      }
    } else if (anonymousUser) {
      const hasReachedLimit = await checkAnonymousUserLimit(anonymousUser.id);
      if (hasReachedLimit) {
        toast({
          title: translations.title,
          description: translations.description,
          variant: "destructive",
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error in handleLimitCheck:', error);
    return false; // Allow operation to proceed if check fails
  }
};