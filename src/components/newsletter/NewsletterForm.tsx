import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { CaptchaInput } from "./CaptchaInput";

interface NewsletterFormProps {
  onSubmit: (formData: {
    firstName: string;
    lastName: string;
    email: string;
    captchaAnswer: string;
    captchaNumbers: { num1: number; num2: number };
  }) => void;
  isSubmitting: boolean;
}

export const NewsletterForm = ({ onSubmit, isSubmitting }: NewsletterFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaNumbers, setCaptchaNumbers] = useState({ num1: 0, num2: 0 });
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      firstName,
      lastName,
      email,
      captchaAnswer,
      captchaNumbers,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            placeholder={t('newsletter.first_name')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Input
            placeholder={t('newsletter.last_name')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder={t('newsletter.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <CaptchaInput
        value={captchaAnswer}
        onChange={setCaptchaAnswer}
        onNumbersChange={setCaptchaNumbers}
        numbers={captchaNumbers}
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('newsletter.submitting') : t('newsletter.submit')}
      </Button>
    </form>
  );
};