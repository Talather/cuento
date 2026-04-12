import { PricingPlan } from "@/types/pricing";

export const getPlanFeatures = (plan: PricingPlan) => {
  const features = [];
  
  // Basic features for all plans
  //features.push({ translationKey: 'pricing.features.download_pdf' });
  
  switch (plan.name) {
    case 'Cuentito Pack 5':
      features.push(
        { translationKey: 'pricing.features.no_ads' },
        { translationKey: 'pricing.features.instant_generation_sixty' },
        { translationKey: 'pricing.features.pack_one_time' },
        
        
      );
      break;
    case 'Cuentito 5':
      features.push(
        { translationKey: 'pricing.features.no_ads' },
        { translationKey: 'pricing.features.five_all_months' },
        { translationKey: 'pricing.features.instant_generation_fortyfive' },
        { translationKey: 'pricing.features.two_illustrations' },
        { translationKey: 'pricing.features.download_pdf' },
        { translationKey: 'pricing.features.longer_stories' },
        { translationKey: 'pricing.features.language' },
        { translationKey: 'pricing.features.new_features' },
        { translationKey: 'pricing.features.ten_off' }
        
      );
      break;
      case 'Cuentito 10':
        features.push(
          { translationKey: 'pricing.features.no_ads' },
          { translationKey: 'pricing.features.ten_all_months' },
          { translationKey: 'pricing.features.instant_generation_twenty' },
          { translationKey: 'pricing.features.three_illustrations' },
          { translationKey: 'pricing.features.speech' },
          { translationKey: 'pricing.features.download_pdf' },
          { translationKey: 'pricing.features.longer_stories' },
          { translationKey: 'pricing.features.language' },
          { translationKey: 'pricing.features.new_features' },
          { translationKey: 'pricing.features.twenty_off' }
        );
        break;
  }
  
  return features;
};

export const formatPrice = (price: string | number): number => {
  return typeof price === 'string' ? parseInt(price, 10) : Number(price);
};
