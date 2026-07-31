import Stripe from "stripe";

export function checkoutSettlementRate(session: Stripe.Checkout.Session) {
  return session.currency_conversion?.fx_rate;
}
