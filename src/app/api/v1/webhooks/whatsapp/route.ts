import { NextResponse, type NextRequest } from 'next/server';
import { applyDeliveryStatus } from '@/services/notification.service';

export const dynamic = 'force-dynamic';

/**
 * GET — Meta webhook verification handshake.
 * Echoes hub.challenge when the verify token matches.
 */
export function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const mode = sp.get('hub.mode');
  const token = sp.get('hub.verify_token');
  const challenge = sp.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    token &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

interface MetaStatus {
  id: string;
  status: string;
  errors?: { title?: string; message?: string }[];
}
interface MetaWebhookBody {
  entry?: {
    changes?: { value?: { statuses?: MetaStatus[] } }[];
  }[];
}

/**
 * POST — delivery-status receipts (sent / delivered / read / failed).
 * Always responds 200 so Meta does not retry on our errors.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MetaWebhookBody;
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const status of change.value?.statuses ?? []) {
          const errorMessage =
            status.errors?.[0]?.message ?? status.errors?.[0]?.title;
          await applyDeliveryStatus(status.id, status.status, errorMessage);
        }
      }
    }
  } catch (error) {
    console.error('[whatsapp webhook] error:', error);
  }
  return NextResponse.json({ received: true });
}
