import { supabase } from "@/integrations/supabase/client";
import { getValidSession } from "./sessionUtils";
import { toast } from "@/components/ui/use-toast";
import { SUPABASE_URL } from "./config";

export const sendStoryEmail = async (storyId: string, userId: string, userEmail: string) => {
  try {
    const session = await getValidSession();
    if (!session?.access_token) {
      throw new Error('No valid session available');
    }

    const emailEndpoint = `${SUPABASE_URL}/functions/v1/send-email-story`;

    const response = await fetch(emailEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ storyId, userId, email: userEmail })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error sending story email:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

  } catch (error) {
    console.error('Failed to send story email:', error);
    toast({
      title: "Email Notification",
      description: "We couldn't send you an email notification, but your story was saved successfully.",
      variant: "destructive",
    });
  }
};
