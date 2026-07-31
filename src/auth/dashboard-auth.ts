import type { BetterAuthOptions } from "better-auth";

export type BetterAuthInitializer<Runtime> = (options: BetterAuthOptions) => Runtime;

export function createDashboardAuth<Runtime>(betterAuth: BetterAuthInitializer<Runtime>): Runtime {
  return betterAuth({
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
  });
}
