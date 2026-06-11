import { z } from 'zod';

/** Manual tracking lookup (Order ID + phone). */
export const trackSchema = z.object({
  trackingId: z.string().min(1, 'Order ID is required').max(60),
  phone: z.string().min(6, 'A valid phone number is required').max(20),
});

export type TrackInput = z.infer<typeof trackSchema>;
