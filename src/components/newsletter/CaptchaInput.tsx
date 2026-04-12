import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface CaptchaInputProps {
  value: string;
  onChange: (value: string) => void;
  onNumbersChange: (numbers: { num1: number; num2: number }) => void;
  numbers: { num1: number; num2: number };
  disabled?: boolean;
}

export const CaptchaInput = ({ value, onChange, onNumbersChange, numbers, disabled }: CaptchaInputProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    onNumbersChange({ num1, num2 });
    onChange("");
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-gray-50 rounded-md">
        <p className="mb-2">
          {t('newsletter.captcha_question', { num1: numbers.num1, num2: numbers.num2 })}
        </p>
        <Input
          type="number"
          placeholder={t('newsletter.captcha_placeholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
          className="max-w-[200px] mx-auto"
        />
      </div>
    </div>
  );
};