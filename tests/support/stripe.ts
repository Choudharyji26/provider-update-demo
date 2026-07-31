import type Stripe from "stripe";

type CheckoutFxRate = NonNullable<Stripe.Checkout.Session["currency_conversion"]>["fx_rate"];

export function checkoutSessionDouble(fxRate: CheckoutFxRate): Stripe.Checkout.Session {
  return {
    currency_conversion: {
      fx_rate: fxRate,
    },
  } as Stripe.Checkout.Session;
}

export function paymentIntentDouble(status: Stripe.PaymentIntent.Status): Stripe.PaymentIntent {
  return { status } as Stripe.PaymentIntent;
}
