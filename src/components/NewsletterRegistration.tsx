import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { NewsletterForm } from "./newsletter/NewsletterForm";

export const NewsletterRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const validateCaptcha = (answer: string, num1: number, num2: number) => {
    const expectedAnswer = num1 + num2;
    return parseInt(answer) === expectedAnswer;
  };

  const handleSubmit = async ({
    firstName,
    lastName,
    email,
    captchaAnswer,
    captchaNumbers,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    captchaAnswer: string;
    captchaNumbers: { num1: number; num2: number };
  }) => {
    if (!validateCaptcha(captchaAnswer, captchaNumbers.num1, captchaNumbers.num2)) {
      toast({
        title: t('newsletter.error_title'),
        description: t('newsletter.error_invalid_captcha'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert([{ first_name: firstName, last_name: lastName, email }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t('newsletter.error_title'),
            description: t('newsletter.error_duplicate_email'),
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Send email notification
      await supabase.functions.invoke('send-newsletter-notification', {
        body: {
          firstName,
          lastName,
          email,
        },
      });

      toast({
        title: t('newsletter.success_title'),
        description: t('newsletter.success_description'),
      });

    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: t('newsletter.error_title'),
        description: t('newsletter.error_generic'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-16 p-8 bg-white shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">{t('newsletter.title')}</h2>
        <p className="text-muted-foreground">
          {t('newsletter.description')}
        </p>
      </div>
      <NewsletterForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </Card>
  );
};