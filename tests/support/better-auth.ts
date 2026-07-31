import type { BetterAuthOptions } from "better-auth";

import type { BetterAuthInitializer } from "../../src/auth/dashboard-auth.ts";

export function betterAuthDouble(): {
  configurations: BetterAuthOptions[];
  initialize: BetterAuthInitializer<{ kind: "better-auth-double" }>;
} {
  const configurations: BetterAuthOptions[] = [];

  return {
    configurations,
    initialize(options) {
      configurations.push(options);
      return { kind: "better-auth-double" };
    },
  };
}
