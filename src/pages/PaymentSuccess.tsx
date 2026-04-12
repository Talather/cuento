import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Nav } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Handle MercadoPago success
        const mpStatus = searchParams.get("collection_status");
        const mpPaymentId = searchParams.get("payment_id");
        const mpExternalReference = searchParams.get("external_reference");

        // Handle Stripe success
        const sessionId = searchParams.get("session_id");

        if (mpStatus && mpPaymentId && mpExternalReference) {
          // Process MercadoPago payment
          if (mpStatus === "approved") {
            const [userId, planId] = mpExternalReference.split(":");

            // Check if payment was already processed
            const { data: existingPayment } = await supabase
              .from('processed_payments')
              .select('id')
              .eq('payment_id', mpPaymentId)
              .single();

            if (existingPayment) {
              toast({
                title: t("payment.already_processed.title"),
                description: t("payment.already_processed.description"),
              });
              setIsProcessing(false);
              return;
            }

            // Get the subscription plan details
            const { data: plan, error: planError } = await supabase
              .from('subscription_plans')
              .select('story_credits')
              .eq('id', planId)
              .single();

            if (planError) throw planError;

            // Add the credits to the user's profile
            const { error: updateError } = await supabase.rpc(
              'add_story_credits',
              { 
                p_user_id: userId,
                p_credits: plan.story_credits
              }
            );

            if (updateError) throw updateError;

            // Record the processed payment
            const { error: recordError } = await supabase
              .from('processed_payments')
              .insert({
                payment_id: mpPaymentId,
                user_id: userId,
                plan_id: planId,
                credits_added: plan.story_credits
              });

            if (recordError) throw recordError;

            toast({
              title: t("payment.success.title"),
              description: t("payment.success.description", { credits: plan.story_credits }),
            });
          }
        } else if (sessionId) {
          // Process Stripe payment
          const { data: session } = await supabase.auth.getSession();
          if (!session?.session?.user) {
            throw new Error("No authenticated user found");
          }

          // Verify the payment was successful via webhook
          // The webhook will handle adding credits and recording the payment
          toast({
            title: t("payment.success.title"),
            description: t("payment.processing.description"),
          });
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast({
          title: t("payment.error.title"),
          description: t("payment.error.description"),
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, toast, t]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-4">{t("payment.processing.title")}</h1>
            <p className="text-gray-600">
              {t("payment.processing.description")}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t("payment.success.title")}</h1>
          <p className="text-gray-600 mb-6">
            {t("payment.success.message")}
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate("/")}>
              {t("payment.success.create_story")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/library")}>
              {t("payment.success.go_to_library")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}