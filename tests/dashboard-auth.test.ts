import assert from "node:assert/strict";
import test from "node:test";

import { createDashboardAuth } from "../src/auth/dashboard-auth.ts";
import { betterAuthDouble } from "./support/better-auth.ts";

test("dashboard auth configures local credentials and short cookie caching through a double", () => {
  const auth = betterAuthDouble();

  const runtime = createDashboardAuth(auth.factory);

  assert.deepEqual(runtime, { kind: "better-auth-double" });
  assert.deepEqual(auth.configurations, [
    {
      appName: "Metric Harbor",
      baseURL: "https://dashboard.example.invalid",
      emailAndPassword: { enabled: true },
      session: {
        cookieCache: {
          enabled: true,
          maxAge: 300,
        },
      },
      trustedOrigins: ["https://dashboard.example.invalid"],
    },
  ]);
});
