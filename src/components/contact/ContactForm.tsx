import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CaptchaInput } from "../newsletter/CaptchaInput";

export const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    captchaAnswer: "",
  });
  const [captchaNumbers, setCaptchaNumbers] = useState({ num1: 0, num2: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          ...formData,
          captchaNumbers,
        },
      });

      if (error) throw error;

      toast({
        title: "¡Mensaje enviado!",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        captchaAnswer: "",
      });
    } catch (error) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Error al enviar el mensaje",
        description: "Por favor intenta nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 text-left">
          <Label htmlFor="firstName">Nombre *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2 text-left">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="message">Mensaje *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          required
          className="min-h-[150px]"
        />
      </div>

      <CaptchaInput
        value={formData.captchaAnswer}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, captchaAnswer: value }))
        }
        onNumbersChange={setCaptchaNumbers}
        numbers={captchaNumbers}
        disabled={isSubmitting}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar mensaje"}
      </Button>
    </form>
  );
};