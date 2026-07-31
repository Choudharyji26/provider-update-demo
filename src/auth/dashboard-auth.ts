import type { BetterAuthOptions } from "better-auth";

export interface DashboardAuthFactory<Runtime> {
  create(options: BetterAuthOptions): Runtime;
}

export function createDashboardAuth<Runtime>(factory: DashboardAuthFactory<Runtime>): Runtime {
  return factory.create({
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
