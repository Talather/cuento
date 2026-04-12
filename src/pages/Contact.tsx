import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";

const Contact = () => {
  return (
    <div className="container py-16">
      <Card className="max-w-3xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Contacto</h1>
          <p className="text-muted-foreground">
            ¿Tenés alguna pregunta o sugerencia? ¡Nos encantaría escucharte!
          </p>
        </div>
        <ContactForm />
      </Card>
    </div>
  );
};

export default Contact;