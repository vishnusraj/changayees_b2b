-- Track delivery attempts for the WhatsApp engine retry/backoff loop.
ALTER TABLE "whatsapp_notifications" ADD COLUMN "retry_count" INTEGER NOT NULL DEFAULT 0;
