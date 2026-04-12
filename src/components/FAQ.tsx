import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export const FAQ = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          {t("faq.title")}
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent className="text-left">
                  <p className="mb-4">{faq.answer}</p>
                  <Button 
                    onClick={() => navigate("/story/new")}
                    className="mt-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("faq.button")}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};
