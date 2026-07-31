import type { BetterAuthOptions } from "better-auth";

import type { DashboardAuthFactory } from "../../src/auth/dashboard-auth.ts";

export function betterAuthDouble(): {
  configurations: BetterAuthOptions[];
  factory: DashboardAuthFactory<{ kind: "better-auth-double" }>;
} {
  const configurations: BetterAuthOptions[] = [];

  return {
    configurations,
    factory: {
      create(options) {
        configurations.push(options);
        return { kind: "better-auth-double" };
      },
    },
  };
}
