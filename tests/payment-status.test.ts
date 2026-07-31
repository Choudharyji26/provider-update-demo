import assert from "node:assert/strict";
import test from "node:test";

import { observePaymentStatus } from "../src/payments/observe-payment-status.ts";
import { paymentIntentDouble } from "./support/stripe.ts";

test("payment status remains an observation and never claims completion", () => {
  const intent = paymentIntentDouble("requires_action");

  assert.deepEqual(observePaymentStatus(intent), {
    completionClaimed: false,
    provider: "stripe",
    status: "requires_action",
  });
});
