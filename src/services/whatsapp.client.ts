/**
 * Meta WhatsApp Cloud API client (architecture §7).
 *
 * Proactive messages use a pre-approved utility template carrying the dynamic
 * text as a single body parameter ({{1}}). When credentials are absent in
 * development, sends are simulated (logged) so the engine is testable end to end.
 *
 * Node runtime only.
 */
const GRAPH_VERSION = 'v21.0';

export interface SendResult {
  providerId: string | null;
  simulated: boolean;
}

export class WhatsAppConfigError extends Error {}

interface SendInput {
  to: string;
  /** Logical template name (logged); the Meta template sent is configurable. */
  template: string;
  message: string;
}

export async function sendWhatsAppMessage({
  to,
  template,
  message,
}: SendInput): Promise<SendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  // Not configured → simulate in dev, fail loudly in prod.
  if (!phoneNumberId || !token) {
    if (process.env.NODE_ENV === 'production') {
      throw new WhatsAppConfigError('WhatsApp Cloud API is not configured');
    }
    console.info(`[whatsapp:dev] (${template}) -> ${to}: ${message}`);
    return { providerId: null, simulated: true };
  }

  const metaTemplate = process.env.WHATSAPP_TEMPLATE ?? template;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG ?? 'en';

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: metaTemplate,
      language: { code: languageCode },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: message }],
        },
      ],
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const data = (await res.json()) as {
    messages?: { id: string }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? `WhatsApp send failed (${res.status})`);
  }

  return { providerId: data.messages?.[0]?.id ?? null, simulated: false };
}
