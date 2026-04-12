import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useUserCredits } from "@/hooks/useUserCredits";
import { Progress } from "@/components/ui/progress";
import { LoadingAd } from "@/components/LoadingAd";

interface StoryPromptFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export const StoryPromptForm = ({ onSubmit, isLoading }: StoryPromptFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data } = useUserCredits();

  // Effect to handle loading progress and message rotation
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      setMessageIndex(0);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 300);

      messageInterval = setInterval(() => {
        setMessageIndex((prev) => {
          const messages = t(
            "story_prompt.form.generating_progress." +
              (data?.isAuthenticated ? "authenticated" : "anonymous"),
            { returnObjects: true }
          ) as string[];
          return (prev + 1) % messages.length;
        });
      }, 5000);
    } else {
      setProgress(0);
      setMessageIndex(0);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [isLoading, data?.isAuthenticated, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (data?.isAuthenticated && data?.credits <= 0) {
      toast({
        variant: "destructive",
        title: t("errors.no_credits.title"),
        description: t("errors.no_credits.description"),
      });
      return;
    }

    await onSubmit(prompt);
  };

  const getCurrentMessage = () => {
    const messages = t(
      "story_prompt.form.generating_progress." +
        (data?.isAuthenticated ? "authenticated" : "anonymous"),
      { returnObjects: true }
    ) as string[];
    return messages[messageIndex % messages.length];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {data?.isAuthenticated ? (
          data.credits > 0 ? (
            <p className="text-muted-foreground">
              {t("story_prompt.welcome.authenticated_with_credits", {
                credits: data.credits,
              })}
            </p>
          ) : (
            <p className="text-muted-foreground">
              {t("story_prompt.welcome.authenticated_no_credits")}
            </p>
          )
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              {t("story_prompt.welcome.guest_title")}
            </h2>
            <p className="text-muted-foreground">
              {t("story_prompt.welcome.guest_description")}
            </p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={t("story_prompt.form.placeholder")}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={!prompt.trim() || isLoading}>
          {isLoading
            ? t("story_prompt.form.generating")
            : t("story_prompt.form.generate")}
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {getCurrentMessage()}
          </p>
          <LoadingAd />
        </div>
      )}
    </div>
  );
};
