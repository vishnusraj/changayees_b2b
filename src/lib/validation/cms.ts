import { z } from 'zod';
import { PublishStatus, RecordStatus } from '@/generated/prisma';

const optionalString = (max: number) => z.string().max(max).optional();

// --- Blog ---
export const blogCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: optionalString(200),
  excerpt: optionalString(500),
  content: z.string().optional(),
  featuredImage: optionalString(500),
  seoTitle: optionalString(200),
  seoDescription: optionalString(300),
  status: z.nativeEnum(PublishStatus).optional(),
});
export const blogUpdateSchema = blogCreateSchema.partial();

// --- Testimonial ---
export const testimonialCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  organization: optionalString(160),
  designation: optionalString(120),
  testimonial: z.string().min(1, 'Testimonial is required').max(1000),
  photo: optionalString(500),
  sortOrder: z.number().int().optional(),
  status: z.nativeEnum(PublishStatus).optional(),
});
export const testimonialUpdateSchema = testimonialCreateSchema.partial();

// --- Case Study ---
export const caseStudyCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: optionalString(200),
  industryId: z.string().uuid().optional().or(z.literal('')),
  clientName: optionalString(160),
  location: optionalString(160),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  results: z.string().optional(),
  featuredImage: optionalString(500),
  status: z.nativeEnum(PublishStatus).optional(),
});
export const caseStudyUpdateSchema = caseStudyCreateSchema.partial();

// --- Catalog ---
export const catalogCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: optionalString(200),
  description: optionalString(1000),
  thumbnail: optionalString(500),
  fileUrl: z.string().min(1, 'File URL is required').max(500),
  category: optionalString(120),
  status: z.nativeEnum(PublishStatus).optional(),
});
export const catalogUpdateSchema = catalogCreateSchema.partial();

// --- Industry ---
export const industryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(160),
  slug: optionalString(160),
  description: z.string().optional(),
  bannerImage: optionalString(500),
  status: z.nativeEnum(RecordStatus).optional(),
});
export const industryUpdateSchema = industryCreateSchema.partial();

// --- Product ---
export const productCreateSchema = z.object({
  productCode: z.string().min(1, 'Product code is required').max(60),
  name: z.string().min(1, 'Name is required').max(200),
  slug: optionalString(200),
  shortDescription: optionalString(300),
  description: z.string().optional(),
  categoryId: z.string().uuid('Category is required'),
  subcategoryId: z.string().uuid().optional().or(z.literal('')),
  fabricType: optionalString(120),
  moq: z.number().int().nonnegative().optional(),
  availableSizes: optionalString(500),
  availableColors: optionalString(500),
  isFeatured: z.boolean().optional(),
  status: z.nativeEnum(PublishStatus).optional(),
});
export const productUpdateSchema = productCreateSchema.partial();
