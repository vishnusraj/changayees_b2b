import { z } from 'zod';
import { OrderStatus } from '@/generated/prisma';

const orderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  itemLabel: z.string().max(200).optional(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  remarks: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(160),
  organization: z.string().max(200).optional(),
  phone: z.string().min(7, 'A valid phone number is required').max(20),
  email: z.string().email().optional().or(z.literal('')),
  assignedManager: z.string().uuid().optional(),
  expectedDelivery: z.string().optional(),
  consentWhatsapp: z.boolean().optional(),
  currentStatus: z.nativeEnum(OrderStatus).optional(),
  items: z.array(orderItemSchema).min(1, 'Add at least one item').max(50),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  customerNote: z.string().max(1000).optional(),
  internalNote: z.string().max(1000).optional(),
  sendNotification: z.boolean().optional(),
});

export const customerNoteSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000),
  visibleToCustomer: z.boolean().optional(),
});

export type CreateOrderInputDto = z.infer<typeof createOrderSchema>;
