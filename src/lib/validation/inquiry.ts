import { z } from 'zod';

/** Product inquiry (quick inquiry from a product detail page). */
export const inquirySchema = z.object({
  name: z.string().min(1, 'Your name is required').max(120),
  phone: z
    .string()
    .min(7, 'A valid phone number is required')
    .max(20),
  email: z.string().email().optional().or(z.literal('')),
  organization: z.string().max(160).optional(),
  message: z.string().max(1000).optional(),
  productSlug: z.string().max(160).optional(),
  productName: z.string().max(200).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
