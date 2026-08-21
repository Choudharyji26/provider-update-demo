import Stripe from "stripe";

type CheckoutFxRate = Parameters<typeof Stripe.Decimal.from>[0];

export function checkoutSessionDouble(fxRate: CheckoutFxRate): Stripe.Checkout.Session {
  return {
    currency_conversion: {
      fx_rate: Stripe.Decimal.from(fxRate),
    },
  } as Stripe.Checkout.Session;
}

export function paymentIntentDouble(status: Stripe.PaymentIntent.Status): Stripe.PaymentIntent {
  return { status } as Stripe.PaymentIntent;
}
