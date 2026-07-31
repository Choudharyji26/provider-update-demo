import type Stripe from "stripe";

export function observePaymentStatus(intent: Stripe.PaymentIntent) {
  return {
    completionClaimed: false as const,
    provider: "stripe" as const,
    status: intent.status,
  };
}
