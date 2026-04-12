export interface Feature {
  text: string;
  translationKey?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  price_usd: number;
  story_credits: number;
  is_recurring: boolean;
  payment_link: string | null;
  features?: Feature[];
  stripe_price_id?: string;
}

export interface PricingTierProps {
  plan: PricingPlan;
  isPopular?: boolean;
  loadingTier: string | null;
  onSubscribe: (planId: string, paymentLink: string | null) => void;
}