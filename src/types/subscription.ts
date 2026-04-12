export interface Feature {
  text: string;
  translationKey?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  story_credits: number;
  is_recurring: boolean;
  payment_link: string | null;
  features?: Feature[];
}