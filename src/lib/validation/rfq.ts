import { z } from 'zod';

const rfqItemSchema = z.object({
  customLabel: z.string().max(200).optional(),
  productId: z.string().uuid().optional(),
  quantity: z.number().int().positive().optional(),
});

const rfqFileSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().max(120).optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

/** RFQ submission payload (from the wizard). */
export const rfqSubmitSchema = z.object({
  organization: z.string().min(1, 'Institution name is required').max(200),
  contactPerson: z.string().min(1, 'Contact person is required').max(120),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().min(7, 'A valid phone number is required').max(20),
  location: z.string().max(160).optional(),
  requirements: z.string().max(2000).optional(),
  expectedQuantity: z.number().int().positive().optional(),
  studentCount: z.number().int().nonnegative().optional(),
  staffCount: z.number().int().nonnegative().optional(),
  expectedDelivery: z.string().optional(),
  consentWhatsapp: z.boolean().optional(),
  items: z.array(rfqItemSchema).max(50).optional(),
  files: z.array(rfqFileSchema).max(20).optional(),
});

export type RfqSubmitInput = z.infer<typeof rfqSubmitSchema>;
