import assert from "node:assert/strict";
import test from "node:test";

import { analyticsConversionRate } from "../src/analytics/checkout-conversion-rate.ts";
import { checkoutSessionDouble } from "./support/stripe.ts";

test("analytics reads the checkout conversion rate from the observed response", () => {
  const session = checkoutSessionDouble("0.9243");

  assert.equal(analyticsConversionRate(session)?.toString(), "0.9243");
});
