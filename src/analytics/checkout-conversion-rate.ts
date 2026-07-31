import Stripe from "stripe";

export function analyticsConversionRate(session: Stripe.Checkout.Session) {
  return session.currency_conversion?.fx_rate;
}
