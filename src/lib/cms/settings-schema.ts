/**
 * Canonical settings keys + defaults for the settings-driven CMS modules
 * (General, Contact Information, Footer, Homepage). The admin Settings page
 * renders these; public components read them with these fallbacks.
 */
export interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  fallback: string;
}

export interface SettingGroup {
  id: string;
  title: string;
  fields: SettingField[];
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: 'general',
    title: 'General',
    fields: [
      { key: 'company_name', label: 'Company name', type: 'text', fallback: 'Changayees' },
      {
        key: 'company_tagline',
        label: 'Tagline',
        type: 'text',
        fallback: 'Institutional Uniform Procurement, Simplified',
      },
      {
        key: 'company_description',
        label: 'Description',
        type: 'textarea',
        fallback:
          'Mobile-first B2B procurement platform for institutional uniforms — discover, request quotes, and track production.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Information',
    fields: [
      { key: 'contact_phone', label: 'Phone', type: 'text', fallback: '' },
      {
        key: 'contact_email',
        label: 'Email',
        type: 'text',
        fallback: 'sales@changayees.com',
      },
      { key: 'address', label: 'Address', type: 'textarea', fallback: 'India' },
      {
        key: 'whatsapp_number',
        label: 'WhatsApp number',
        type: 'text',
        fallback: '',
      },
      {
        key: 'business_hours',
        label: 'Business hours',
        type: 'text',
        fallback: 'Mon–Sat, 9:30 AM – 6:30 PM IST',
      },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    fields: [
      {
        key: 'footer_about',
        label: 'About text',
        type: 'textarea',
        fallback:
          'Mobile-first B2B procurement platform for institutional uniforms.',
      },
      { key: 'social_facebook', label: 'Facebook URL', type: 'text', fallback: '' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'text', fallback: '' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text', fallback: '' },
    ],
  },
  {
    id: 'homepage',
    title: 'Homepage',
    fields: [
      {
        key: 'home_hero_eyebrow',
        label: 'Hero eyebrow',
        type: 'text',
        fallback: 'B2B Uniform Procurement',
      },
      {
        key: 'home_hero_title',
        label: 'Hero headline',
        type: 'text',
        fallback: 'Institutional uniform procurement, simplified.',
      },
      {
        key: 'home_hero_subtitle',
        label: 'Hero subheadline',
        type: 'textarea',
        fallback:
          'Discover products, request quotes, and track production in real time — for schools, colleges, hospitals, hotels, and corporates across India.',
      },
    ],
  },
];

/** All known keys → fallback, for resolving public reads. */
export const SETTING_FALLBACKS: Record<string, string> = Object.fromEntries(
  SETTING_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.fallback])),
);
