
import { Check, Loader2, ChevronDown, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { PricingTierProps } from "@/types/pricing";
import { formatPrice } from "@/utils/pricingUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export const PricingTier = ({ plan, isPopular, loadingTier, onSubscribe }: PricingTierProps) => {
  const { t } = useTranslation();
  const [isArgentina, setIsArgentina] = useState<boolean | null>(null);

  useEffect(() => {
    // Try to get user's country using the Geolocation API
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        setIsArgentina(data.country_code === 'AR');
        console.log('Country detected:', data.country_code);
      })
      .catch(error => {
        console.error('Error detecting country:', error);
        setIsArgentina(false);
      });
  }, []);

  const formattedPrice = formatPrice(isArgentina ? plan.price : plan.price_usd);

  const renderPrice = () => {
    if (isArgentina === null) {
      return <span className="text-4xl font-bold tracking-tight text-gray-900">$ {formattedPrice}</span>;
    }

    return (
      <span className="text-4xl font-bold tracking-tight text-gray-900">
        {isArgentina ? (
          <>
            <span className="text-2xl">🇦🇷</span> $ {formattedPrice}
          </>
        ) : (
          <>
            U$S {formattedPrice}
          </>
        )}
      </span>
    );
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string, directLink: string | null = null) => {
    localStorage.setItem('preferredPaymentMethod', method);
    onSubscribe(plan.id, directLink);
  };

  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl bg-white p-6 shadow-lg ${
        isPopular ? 'border-2 border-primary' : 'border border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-white">
          {t('pricing.most_popular')}
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-semibold leading-8">{plan.name}</h3>
        <p className="mt-6 flex items-center justify-center gap-x-2">
          {renderPrice()}
          {plan.is_recurring && (
            <span className="text-sm font-semibold leading-6 text-gray-600">{t('pricing.month')}</span>
          )}
        </p>
      </div>

      <ul role="list" className="mt-8 flex-grow space-y-3 text-sm leading-6 text-gray-600">
        {plan.features?.map((feature, index) => (
          <li key={index} className="flex gap-x-3">
            <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
            {feature.translationKey ? t(feature.translationKey) : feature.text}
          </li>
        ))}
      </ul>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="mt-8 w-full"
            disabled={loadingTier === plan.id}
          >
            {loadingTier === plan.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {t('pricing.subscribe_button')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={() => handlePaymentMethodSelect('mercadopago', plan.payment_link)} className="flex items-center gap-2">
            <img 
              src="https://http2.mlstatic.com/frontend-assets/ui-navigation/6.7.0/mercadopago/favicon.svg" 
              alt="Mercado Pago" 
              className="h-5 w-auto"
            />
            <span>Mercado Pago {plan.is_recurring && '(subscription)'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePaymentMethodSelect('stripe')} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#635BFF]" />
            <span>Stripe {plan.is_recurring && '(subscription)'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
