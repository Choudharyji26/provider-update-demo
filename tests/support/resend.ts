import type { CreateEmailOptions, CreateEmailResponse } from "resend";

import type { DashboardEmailClient } from "../../src/notifications/send-dashboard-invite.ts";

export function resendDouble(): {
  client: DashboardEmailClient;
  sent: CreateEmailOptions[];
} {
  const sent: CreateEmailOptions[] = [];

  return {
    client: {
      emails: {
        async send(payload): Promise<CreateEmailResponse> {
          sent.push(payload);
          return {
            data: { id: "email-double-0001" },
            error: null,
            headers: null,
          };
        },
      },
    },
    sent,
  };
}
