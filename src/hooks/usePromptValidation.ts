import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { checkForBannedWords } from "@/utils/contentFilter";

export const usePromptValidation = (initialPrompt: string = "") => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const { toast } = useToast();

  const validatePrompt = (): boolean => {
    const bannedWord = checkForBannedWords(prompt);
    if (bannedWord) {
      toast({
        title: "Contenido inapropiado",
        description: "Tu historia contiene contenido inapropiado. Por favor, revisa y vuelve a intentar.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    prompt,
    setPrompt,
    validatePrompt,
  };
};