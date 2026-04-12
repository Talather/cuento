import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { PricingTierProps } from "@/types/pricing";
import { formatPrice } from "@/utils/pricingUtils";

export const PricingTier = ({ plan, isPopular, loadingTier, onSubscribe }: PricingTierProps) => {
  const { t } = useTranslation();
  const formattedPrice = formatPrice(plan.price);

  return (
    <div
      className={`relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
        isPopular ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
          {t('pricing.most_popular')}
        </span>
      )}
      <div className="text-center">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <p className="text-3xl font-bold mt-4">
          ${formattedPrice}{plan.is_recurring ? t('pricing.month') : ''}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {plan.story_credits} {plan.is_recurring ? t('pricing.stories_per_month') : t('pricing.stories')}
        </p>
      </div>
      <ul className="mt-6 space-y-3">
        {/* First feature is always the story credits */}
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span className="text-sm">{plan.story_credits} {t('pricing.stories')}</span>
        </li>
        
        {/* Custom features for each plan */}
        {plan.features?.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {feature.translationKey ? t(feature.translationKey) : feature.text}
            </span>
          </li>
        ))}
      </ul>
      <Button 
        className="w-full mt-6"
        onClick={() => onSubscribe(plan.id, plan.payment_link)}
        disabled={loadingTier === plan.id}
      >
        {loadingTier === plan.id ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('pricing.button.processing')}
          </>
        ) : (
          t('pricing.button.choose_plan')
        )}
      </Button>
    </div>
  );
};