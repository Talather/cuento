
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { checkForBannedWords } from "@/utils/contentFilter";
import { v4 as uuidv4 } from 'uuid';
import { useSession } from "@/hooks/useSession";
import { ImageGenerationService } from "@/services/ImageGenerationService";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();
  const imageService = new ImageGenerationService();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the image generation",
        variant: "destructive",
      });
      return;
    }

    // Check for banned words before proceeding
    const bannedWord = checkForBannedWords(prompt);
    if (bannedWord) {
      toast({
        title: "Inappropriate Content",
        description: "Your prompt contains inappropriate content. Please revise and try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      
       const imageUrl = await imageService.generateImage(prompt.trim());
      
      if (!imageUrl) {
        throw new Error('Failed to generate image');
      }
      
      setGeneratedImage(imageUrl);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Generate an Image</h2>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter your image prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={generateImage}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
          
          {generatedImage && (
            <div className="mt-4">
              <img
                src={generatedImage}
                alt="Generated image"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
