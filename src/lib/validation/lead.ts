import { z } from 'zod';
import { LeadStatus } from '@/generated/prisma';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  phone: z.string().min(7, 'A valid phone number is required').max(20),
  email: z.string().email().optional().or(z.literal('')),
  organization: z.string().max(160).optional(),
  designation: z.string().max(120).optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional().or(z.literal('')),
  organization: z.string().max(160).optional(),
  designation: z.string().max(120).optional(),
  notes: z.string().max(4000).optional(),
  industryId: z.string().uuid().optional().or(z.literal('')),
});

export const assignLeadSchema = z.object({
  assignedTo: z.string().uuid().nullable(),
});

export const changeLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
