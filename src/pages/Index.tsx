
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { FAQ } from "@/components/FAQ";
import { NewsletterRegistration } from "@/components/NewsletterRegistration";
import { useTranslation } from "react-i18next";
export default function Index() {
  const { t } = useTranslation();

  return (
    <div>
      <Hero />
      <Features />
      <FAQ />
      <NewsletterRegistration />
    </div>
  );
}
