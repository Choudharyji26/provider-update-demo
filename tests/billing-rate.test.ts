import assert from "node:assert/strict";
import test from "node:test";

import { checkoutSettlementRate } from "../src/billing/checkout-settlement-rate.ts";
import { checkoutSessionDouble } from "./support/stripe.ts";

test("billing reads the checkout settlement rate without claiming payment completion", () => {
  const session = checkoutSessionDouble("1.0835");

  assert.equal(checkoutSettlementRate(session)?.toString(), "1.0835");
});
