import { z } from 'zod';

/** Lead-capture gate before a catalog download (Screens #8). */
export const catalogDownloadSchema = z.object({
  catalogId: z.string().min(1, 'Catalog is required'),
  name: z.string().min(1, 'Your name is required').max(120),
  phone: z.string().min(7, 'A valid phone number is required').max(20),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  organization: z.string().max(160).optional(),
});

export type CatalogDownloadInput = z.infer<typeof catalogDownloadSchema>;
