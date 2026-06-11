/**
 * Industry template content.
 *
 * The `industries` table holds name/slug/description/banner; the editorial
 * content (intro, challenges) and the industry → category mapping used for
 * recommendations live here until they move into the CMS. This is what makes
 * the industry pages "dynamic templates": one template, content-driven per slug.
 */
import {
  GraduationCap,
  School,
  HeartPulse,
  Hotel,
  Building2,
  Factory,
  type LucideIcon,
} from 'lucide-react';

export interface IndustryChallenge {
  title: string;
  description: string;
}

export interface IndustryContent {
  intro: string;
  challenges: IndustryChallenge[];
  /** Category slugs used to recommend products for this industry. */
  categorySlugs: string[];
}

export const INDUSTRY_CONTENT: Record<string, IndustryContent> = {
  schools: {
    intro:
      'Reliable, comfortable, and durable uniforms for students of every age — delivered on time across all sizes.',
    categorySlugs: ['school-uniforms', 'sports-uniforms', 'accessories'],
    challenges: [
      {
        title: 'Consistent sizing at scale',
        description:
          'Full size sets across grades with accurate, repeatable fits year after year.',
      },
      {
        title: 'On-time delivery before term',
        description:
          'Production planning and tracking that meets academic-year deadlines.',
      },
      {
        title: 'Durable, easy-care fabrics',
        description:
          'Wrinkle-resistant, colour-fast materials built for daily wear and washing.',
      },
    ],
  },
  colleges: {
    intro:
      'Smart, contemporary uniforms and department wear for colleges and universities.',
    categorySlugs: ['college-uniforms', 'sports-uniforms'],
    challenges: [
      {
        title: 'Modern, professional look',
        description:
          'Contemporary cuts and fabrics that students are happy to wear.',
      },
      {
        title: 'Department-wise variants',
        description:
          'Colour and badge variations managed cleanly across departments.',
      },
      {
        title: 'Bulk reorders made simple',
        description: 'Fast, consistent reorders for new intakes each year.',
      },
    ],
  },
  hospitals: {
    intro:
      'Medical-grade coats and staff uniforms engineered for hygiene, comfort, and professionalism.',
    categorySlugs: ['lab-coats', 'uniform-sarees'],
    challenges: [
      {
        title: 'Hygiene-first fabrics',
        description:
          'Antimicrobial, breathable materials suited to clinical environments.',
      },
      {
        title: 'Role-based identification',
        description:
          'Colour-coding and embroidery to distinguish departments and roles.',
      },
      {
        title: 'Multi-branch consistency',
        description:
          'Standardised wear across every location from a single supplier.',
      },
    ],
  },
  hotels: {
    intro:
      'Elegant, brand-aligned uniforms for hospitality teams — from front desk to housekeeping.',
    categorySlugs: ['corporate-uniforms'],
    challenges: [
      {
        title: 'Brand-aligned styling',
        description:
          'Uniforms that reflect your property’s identity and service standard.',
      },
      {
        title: 'Comfort through long shifts',
        description: 'Breathable, durable fabrics for all-day wear.',
      },
      {
        title: 'Department-wise outfits',
        description:
          'Distinct looks for reception, F&B, and housekeeping teams.',
      },
    ],
  },
  corporate: {
    intro:
      'Professional, branded formalwear that builds a consistent corporate identity for teams of any size.',
    categorySlugs: ['corporate-uniforms'],
    challenges: [
      {
        title: 'Consistent brand identity',
        description: 'Logo embroidery and brand colours applied precisely.',
      },
      {
        title: 'Scale across locations',
        description: 'Reliable supply for distributed teams and new joiners.',
      },
      {
        title: 'Fast, predictable reorders',
        description: 'Reduced reorder cycles with a single accountable partner.',
      },
    ],
  },
  industrial: {
    intro:
      'Rugged, safety-conscious workwear built to withstand demanding industrial environments.',
    categorySlugs: ['corporate-uniforms', 'lab-coats'],
    challenges: [
      {
        title: 'Durability under stress',
        description: 'Heavy-duty fabrics and reinforced construction.',
      },
      {
        title: 'Safety & visibility',
        description: 'High-visibility options and compliant materials.',
      },
      {
        title: 'Large-volume supply',
        description: 'Consistent bulk production for big workforces.',
      },
    ],
  },
};

export const DEFAULT_INDUSTRY_CONTENT: IndustryContent = {
  intro:
    'Tailored bulk uniform procurement for your organisation — discover products, request a quote, and track production end to end.',
  challenges: [],
  categorySlugs: [],
};

export function getIndustryContent(slug: string): IndustryContent {
  return INDUSTRY_CONTENT[slug] ?? DEFAULT_INDUSTRY_CONTENT;
}

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  schools: GraduationCap,
  colleges: School,
  hospitals: HeartPulse,
  hotels: Hotel,
  corporate: Building2,
  industrial: Factory,
};

export function getIndustryIcon(slug: string): LucideIcon {
  return INDUSTRY_ICONS[slug] ?? Building2;
}
