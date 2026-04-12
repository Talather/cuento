import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class ImageGenerationService {
   async generateImage(prompt: string): Promise<string | null> {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Set up headers
      const headers: Record<string, string> = {
        'Authorization': session?.access_token 
          ? `Bearer ${session.access_token}`
          : 'Bearer anonymous'
      };

       const { data, error } = await supabase.functions.invoke('generate-image', {
         body: { 
           prompt,
           requestId: crypto.randomUUID(),
           timestamp: Date.now()
         },
         headers
       });

       if (error) {
         console.error("Image generation error:", error);
         throw error;
      }

       return data.imageURL;
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image. The story will be saved without illustrations.");
      return null;
    }
  }
}
