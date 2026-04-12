
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PricingPlan } from "@/types/pricing";
import { sortSubscriptionPlans } from "@/utils/subscriptionUtils";
import { getPlanFeatures } from "@/utils/pricingUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useSubscriptionManagement = () => {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*');

      if (error) throw error;
      
      const plansWithFeatures = data.map((plan: PricingPlan) => ({
        ...plan,
        features: getPlanFeatures(plan),
      }));
      
      return sortSubscriptionPlans(plansWithFeatures);
    },
  });

  const handleSubscribe = async (planId: string, paymentLink: string | null) => {
    if (!session?.user) {
      localStorage.setItem('pendingSubscription', JSON.stringify({ 
        planId, 
        paymentLink,
        originalPaymentLink: paymentLink 
      }));
      navigate('/login');
      return;
    }

    try {
      setLoadingTier(planId);

      // Get the plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // If the plan has a direct MercadoPago payment link, use that
      if (paymentLink) {
        localStorage.removeItem('pendingSubscription');
        window.location.href = paymentLink;
        return;
      }

      // Check if using Stripe or MercadoPago
      const paymentMethod = localStorage.getItem('preferredPaymentMethod') || 'mercadopago';

      if (paymentMethod === 'stripe' && plan.stripe_price_id) {
        // Create a Stripe checkout session
        const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
          body: { 
            planId, 
            userId: session.user.id 
          }
        });

        if (error) throw error;

        if (data.url) {
          localStorage.removeItem('pendingSubscription');
          window.location.href = data.url;
          return;
        }
      } else {
        // Create a MercadoPago payment/subscription
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: { 
            planId, 
            userId: session.user.id 
          }
        });

        if (error) throw error;

        if (data.checkoutUrl) {
          localStorage.removeItem('pendingSubscription');
          window.location.href = data.checkoutUrl;
          return;
        }
      }

      throw new Error('No payment method available for this plan');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return {
    plans,
    loadingTier,
    handleSubscribe,
  };
};
