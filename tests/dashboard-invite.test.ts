import assert from "node:assert/strict";
import test from "node:test";

import { sendDashboardInvite } from "../src/notifications/send-dashboard-invite.ts";
import { resendDouble } from "./support/resend.ts";

test("dashboard invite uses the Resend shape through a network-free double", async () => {
  const resend = resendDouble();

  const result = await sendDashboardInvite(resend.client, "recipient@example.invalid");

  assert.deepEqual(result, {
    deliveryClaimed: false,
    providerMessageId: "email-double-0001",
  });
  assert.deepEqual(resend.sent, [
    {
      from: "Metric Harbor <dashboard@example.invalid>",
      subject: "Your Metric Harbor dashboard is ready",
      text: "Open the dashboard to review your pending report.",
      to: "recipient@example.invalid",
    },
  ]);
});
