import { useTranslation } from "react-i18next";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PricingTier } from "@/components/subscription/PricingTier";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { isPopularPlan } from "@/utils/subscriptionUtils";

export const SubscriptionModalContent = () => {
  const { t } = useTranslation();
  const { plans, loadingTier, handleSubscribe } = useSubscriptionManagement();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('pricing.title')}</DialogTitle>
        <DialogDescription>
          {t('pricing.description')}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start py-4">
        {plans.map((plan) => (
          <PricingTier
            key={plan.id}
            plan={plan}
            isPopular={isPopularPlan(plan, plans)}
            loadingTier={loadingTier}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    </>
  );
};