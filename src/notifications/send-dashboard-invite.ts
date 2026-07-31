import type { CreateEmailOptions, CreateEmailResponse } from "resend";

export interface DashboardEmailClient {
  emails: {
    send(payload: CreateEmailOptions): Promise<CreateEmailResponse>;
  };
}

export async function sendDashboardInvite(client: DashboardEmailClient, recipient: string) {
  const response = await client.emails.send({
    from: "Metric Harbor <dashboard@example.invalid>",
    subject: "Your Metric Harbor dashboard is ready",
    text: "Open the dashboard to review your pending report.",
    to: recipient,
  });

  if (response.error) {
    throw new Error("Dashboard invite request was not accepted.");
  }

  return {
    deliveryClaimed: false as const,
    providerMessageId: response.data.id,
  };
}
