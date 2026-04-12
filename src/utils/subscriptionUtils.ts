import { PricingPlan } from "@/types/pricing";

export const sortSubscriptionPlans = (plans: PricingPlan[]) => {
  return [...plans].sort((a, b) => {
    // Sort by price in ascending order
    return Number(a.price) - Number(b.price);
  });
};

export const isPopularPlan = (plan: PricingPlan, allPlans: PricingPlan[]): boolean => {
  // Get the sorted plans
  const sortedPlans = sortSubscriptionPlans(allPlans);
  // Find the middle plan
  const middleIndex = Math.floor(sortedPlans.length / 2);
  const middlePlan = sortedPlans[middleIndex];
  
  return plan.id === middlePlan.id;
};