import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackFormField } from "./feedback/FeedbackFormField";
import { RatingSlider } from "./feedback/RatingSlider";

interface StoryFeedbackFormProps {
  storyId: string;
  storyTitle: string;
}

// Input validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_WHATSAPP_LENGTH = 20;
const MAX_SOURCE_LENGTH = 200;
const MAX_COMMENTS_LENGTH = 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sanitize string input
const sanitizeInput = (input: string, maxLength: number): string => {
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const StoryFeedbackForm = ({ storyId, storyTitle }: StoryFeedbackFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    source: "",
    storyRating: 5,
    illustrationRating: 5,
    comments: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate and sanitize inputs
      const sanitizedName = sanitizeInput(formData.name, MAX_NAME_LENGTH);
      const sanitizedEmail = sanitizeInput(formData.email, MAX_EMAIL_LENGTH);
      const sanitizedWhatsapp = sanitizeInput(formData.whatsapp, MAX_WHATSAPP_LENGTH);
      const sanitizedSource = sanitizeInput(formData.source, MAX_SOURCE_LENGTH);
      const sanitizedComments = sanitizeInput(formData.comments, MAX_COMMENTS_LENGTH);
      
      // Validate required fields
      if (sanitizedName.length < 2) {
        throw new Error("El nombre debe tener al menos 2 caracteres");
      }
      
      if (!isValidEmail(sanitizedEmail)) {
        throw new Error("Por favor ingresa un correo electrónico válido");
      }
      
      // Validate ratings are within range
      const storyRating = Math.min(10, Math.max(1, formData.storyRating));
      const illustrationRating = Math.min(10, Math.max(1, formData.illustrationRating));

      const { error: dbError } = await supabase.from("feedback").insert({
        story_id: storyId,
        name: sanitizedName,
        email: sanitizedEmail,
        whatsapp: sanitizedWhatsapp || null,
        source: sanitizedSource || null,
        story_rating: storyRating,
        illustration_rating: illustrationRating,
        comments: sanitizedComments || null,
      });

      if (dbError) throw dbError;

      // Send notification email
      const { error: notificationError } = await supabase.functions.invoke('send-feedback-notification', {
        body: {
          storyId,
          storyTitle,
          name: sanitizedName,
          email: sanitizedEmail,
          whatsapp: sanitizedWhatsapp,
          source: sanitizedSource,
          storyRating,
          illustrationRating,
          comments: sanitizedComments
        },
      });

      if (notificationError) throw notificationError;

      toast({
        title: "¡Gracias por tu feedback!",
        description: "Apreciamos tu opinión.",
      });

      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        source: "",
        storyRating: 5,
        illustrationRating: 5,
        comments: "",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error al enviar el feedback",
        description: error instanceof Error ? error.message : "Por favor intenta nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <FeedbackFormField
          id="name"
          label="Nombre"
          required
          value={formData.name}
          onChange={(value) => updateFormData("name", value)}
        />

        <FeedbackFormField
          id="email"
          label="Correo electrónico"
          type="email"
          required
          value={formData.email}
          onChange={(value) => updateFormData("email", value)}
        />

        <FeedbackFormField
          id="whatsapp"
          label="Número de WhatsApp (opcional)"
          value={formData.whatsapp}
          onChange={(value) => updateFormData("whatsapp", value)}
        />

        <FeedbackFormField
          id="source"
          label="¿Cómo nos conociste? (opcional)"
          value={formData.source}
          onChange={(value) => updateFormData("source", value)}
        />

        <RatingSlider
          id="storyRating"
          label="Califica el cuento (1-10)"
          value={formData.storyRating}
          onChange={(value) => updateFormData("storyRating", value)}
        />

        <RatingSlider
          id="illustrationRating"
          label="Califica las ilustraciones (1-10)"
          value={formData.illustrationRating}
          onChange={(value) => updateFormData("illustrationRating", value)}
        />

        <FeedbackFormField
          id="comments"
          label="Comentarios adicionales (opcional)"
          type="textarea"
          value={formData.comments}
          onChange={(value) => updateFormData("comments", value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar Feedback"}
      </Button>
    </form>
  );
};