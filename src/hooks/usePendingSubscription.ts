import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PendingSubscription {
  planId: string;
  paymentLink: string | null;
}

export const usePendingSubscription = () => {
  const { toast } = useToast();

  const handlePendingSubscription = async (session: any) => {
    try {
      const pendingData = localStorage.getItem('pendingSubscription');
      if (!pendingData) return;

      const subscription: PendingSubscription = JSON.parse(pendingData);
      // console.log('Found pending subscription:', subscription);

      // If there's a direct payment link stored, use that first
      if (subscription.paymentLink) {
        // console.log('Redirecting to stored payment link:', subscription.paymentLink);
        localStorage.removeItem('pendingSubscription');
        window.location.href = subscription.paymentLink;
        return;
      }

      // Otherwise, create a new payment
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          planId: subscription.planId, 
          userId: session.user.id 
        }
      });

      if (error) throw error;

      if (data.checkoutUrl) {
        // console.log('Redirecting to new checkout URL:', data.checkoutUrl);
        localStorage.removeItem('pendingSubscription');
        window.location.href = data.checkoutUrl;
        return;
      }
    } catch (error) {
      // console.error('Error processing pending subscription:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
      localStorage.removeItem('pendingSubscription');
    }
  };

  return { handlePendingSubscription };
};
