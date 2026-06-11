/** Shared lead enums for UI selects/filters (labels + values). */

export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUOTATION_SENT', label: 'Quotation Sent' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
] as const;

export const LEAD_SOURCES = [
  { value: 'RFQ', label: 'RFQ' },
  { value: 'CONTACT_FORM', label: 'Contact Form' },
  { value: 'CATALOG_DOWNLOAD', label: 'Catalog Download' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PRODUCT_INQUIRY', label: 'Product Inquiry' },
  { value: 'BULK_ORDER', label: 'Bulk Order' },
  { value: 'MANUAL', label: 'Manual' },
] as const;
