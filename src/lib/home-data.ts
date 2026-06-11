/**
 * Homepage placeholder content. This is rendered by the static homepage today
 * and is replaced by CMS-driven data (Homepage sections) in the CMS phase.
 * Kept separate so swapping the source is a one-line change in the page.
 */
import {
  GraduationCap,
  School,
  Briefcase,
  Trophy,
  FlaskConical,
  Shirt,
  HeartPulse,
  Hotel,
  Building2,
  Factory,
} from 'lucide-react';
import type { CategoryCardData } from '@/components/marketing/category-card';
import type { IndustryCardData } from '@/components/marketing/industry-card';
import type { CaseStudyCardData } from '@/components/marketing/case-study-card';
import type { TestimonialData } from '@/components/marketing/testimonial-card';
import type { ProductCardData } from '@/components/product/types';

export const FEATURED_CATEGORIES: CategoryCardData[] = [
  {
    name: 'School Uniforms',
    slug: 'school-uniforms',
    description: 'Shirts, trousers, pinafores, blazers and accessories.',
    icon: GraduationCap,
  },
  {
    name: 'College Uniforms',
    slug: 'college-uniforms',
    description: 'Smart, durable uniforms for colleges and universities.',
    icon: School,
  },
  {
    name: 'Corporate Uniforms',
    slug: 'corporate-uniforms',
    description: 'Branded formalwear for teams of every size.',
    icon: Briefcase,
  },
  {
    name: 'Sports Uniforms',
    slug: 'sports-uniforms',
    description: 'Performance jerseys, track pants and team kits.',
    icon: Trophy,
  },
  {
    name: 'Lab Coats',
    slug: 'lab-coats',
    description: 'Hospital and laboratory coats in medical-grade fabric.',
    icon: FlaskConical,
  },
  {
    name: 'Uniform Sarees',
    slug: 'uniform-sarees',
    description: 'Institutional sarees in cotton and silk blends.',
    icon: Shirt,
  },
];

export const INDUSTRIES: IndustryCardData[] = [
  { name: 'Schools', slug: 'schools', icon: GraduationCap },
  { name: 'Colleges', slug: 'colleges', icon: School },
  { name: 'Hospitals', slug: 'hospitals', icon: HeartPulse },
  { name: 'Hotels', slug: 'hotels', icon: Hotel },
  { name: 'Corporate', slug: 'corporate', icon: Building2 },
  { name: 'Industrial', slug: 'industrial', icon: Factory },
];

export const FEATURED_PRODUCTS: ProductCardData[] = [
  {
    id: 'p1',
    slug: 'premium-school-shirt',
    name: 'Premium School Shirt',
    shortDescription: 'Wrinkle-resistant poly-cotton, custom embroidery.',
    moq: 100,
    categoryName: 'School Uniforms',
  },
  {
    id: 'p2',
    slug: 'corporate-formal-blazer',
    name: 'Corporate Formal Blazer',
    shortDescription: 'Tailored fit with optional logo branding.',
    moq: 50,
    categoryName: 'Corporate Uniforms',
  },
  {
    id: 'p3',
    slug: 'medical-lab-coat',
    name: 'Medical Lab Coat',
    shortDescription: 'Antimicrobial, full-sleeve, breathable fabric.',
    moq: 75,
    categoryName: 'Lab Coats',
  },
  {
    id: 'p4',
    slug: 'sports-team-jersey',
    name: 'Sports Team Jersey',
    shortDescription: 'Moisture-wicking with sublimated team design.',
    moq: 60,
    categoryName: 'Sports Uniforms',
  },
];

export const CASE_STUDIES: CaseStudyCardData[] = [
  {
    slug: 'city-public-school',
    title: '2,400 uniforms delivered in 3 weeks',
    clientName: 'City Public School, Chennai',
    industry: 'Schools',
    result: 'On-time delivery across 12 sizes',
  },
  {
    slug: 'metro-hospitals',
    title: 'Standardised medical wear across 5 branches',
    clientName: 'Metro Hospitals Group',
    industry: 'Hospitals',
    result: '5 locations, single supplier',
  },
  {
    slug: 'apex-corporate',
    title: 'Brand-consistent uniforms for 800 staff',
    clientName: 'Apex Corporate Services',
    industry: 'Corporate',
    result: 'Reorder cycle reduced by 40%',
  },
];

export const TESTIMONIALS: TestimonialData[] = [
  {
    name: 'Priya Menon',
    organization: 'City Public School',
    designation: 'Administrator',
    quote:
      'The WhatsApp tracking made our procurement completely transparent. We knew exactly where our order was at every stage.',
  },
  {
    name: 'Rajesh Kumar',
    organization: 'Metro Hospitals',
    designation: 'Procurement Lead',
    quote:
      'Consistent quality across all our branches, and the RFQ process took minutes instead of days.',
  },
  {
    name: 'Anita Desai',
    organization: 'Apex Corporate',
    designation: 'HR Manager',
    quote:
      'Professional, dependable, and genuinely easy to work with for bulk orders.',
  },
];
