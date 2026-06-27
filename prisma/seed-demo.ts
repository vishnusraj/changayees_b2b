/**
 * Changayees — DEMO content seed (NOT production reference data).
 *
 * Populates realistic dummy content across every feature so the app can be
 * tested end-to-end: products (with images/docs), catalogs, blogs, case
 * studies, testimonials, leads, contact requests, RFQs, orders (with full
 * production timeline + tracking links), CMS pages, media, and analytics.
 *
 * It builds on top of `prisma/seed.ts` (which must run first — it creates the
 * roles, categories, subcategories, and industries this script references).
 *
 *   Seed demo content:  npm run db:seed:demo
 *   Clear demo content: npm run db:seed:demo -- --clear
 *
 * Re-running the seed first clears prior demo content, so it is repeatable.
 * "Reference" data (roles, super-admin, categories, industries, settings) is
 * never touched.
 */
import 'dotenv/config';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import {
  PrismaClient,
  PublishStatus,
  RecordStatus,
  LeadSource,
  LeadStatus,
  RfqType,
  RfqStatus,
  OrderStatus,
  NotificationStatus,
  ProductDocumentType,
} from '../src/generated/prisma';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL ?? 'admin@changayees.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const YEAR = new Date().getFullYear();
const img = (key: string, w = 800, h = 800) =>
  `https://picsum.photos/seed/chg-${key}/${w}/${h}`;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);
const pad = (n: number) => n.toString().padStart(4, '0');

const ORDER_SEQUENCE: OrderStatus[] = [
  OrderStatus.INQUIRY_RECEIVED,
  OrderStatus.QUOTATION_SENT,
  OrderStatus.QUOTATION_APPROVED,
  OrderStatus.ORDER_CONFIRMED,
  OrderStatus.FABRIC_ORDERED,
  OrderStatus.FABRIC_RECEIVED,
  OrderStatus.CUTTING_STARTED,
  OrderStatus.CUTTING_COMPLETED,
  OrderStatus.STITCHING_STARTED,
  OrderStatus.STITCHING_COMPLETED,
  OrderStatus.QUALITY_INSPECTION,
  OrderStatus.PACKING,
  OrderStatus.DISPATCHED,
  OrderStatus.DELIVERED,
  OrderStatus.CLOSED,
];
const progressFor = (status: OrderStatus) => {
  const i = ORDER_SEQUENCE.indexOf(status);
  return i < 0 ? 0 : Math.round((i / (ORDER_SEQUENCE.length - 1)) * 100);
};

function log(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`  ✓ ${msg}`);
}

// ---------------------------------------------------------------------------
// Clear (demo content only — never reference data)
// ---------------------------------------------------------------------------

async function clearDemo() {
  // Order matters for FKs (children before parents). Most have onDelete:
  // Cascade, but we are explicit for clarity and to cover non-cascading links.
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.customerNote.deleteMany({});
  await prisma.trackingLink.deleteMany({});
  await prisma.whatsappNotification.deleteMany({});
  await prisma.emailNotification.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  await prisma.rfqItem.deleteMany({});
  await prisma.rfqFile.deleteMany({});
  await prisma.rfq.deleteMany({});

  await prisma.catalogDownload.deleteMany({});
  await prisma.catalog.deleteMany({});

  await prisma.contactRequest.deleteMany({});
  await prisma.lead.deleteMany({});

  await prisma.productImage.deleteMany({});
  await prisma.productDocument.deleteMany({});
  await prisma.product.deleteMany({});

  await prisma.blog.deleteMany({});
  await prisma.caseStudy.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});

  // Demo manager users (everyone except the super admin).
  await prisma.user.deleteMany({ where: { email: { not: SUPER_ADMIN_EMAIL } } });

  log('cleared all demo content');
}

// ---------------------------------------------------------------------------
// Managers (one per non-admin role, so RBAC + assignment can be tested)
// ---------------------------------------------------------------------------

const MANAGERS = [
  { name: 'Priya Sharma', email: 'priya@changayees.com', role: 'Sales Manager' },
  { name: 'Arjun Nair', email: 'arjun@changayees.com', role: 'Order Manager' },
  {
    name: 'Karthik Reddy',
    email: 'karthik@changayees.com',
    role: 'Production Manager',
  },
  {
    name: 'Divya Menon',
    email: 'divya@changayees.com',
    role: 'Marketing Manager',
  },
  { name: 'Sana Iqbal', email: 'sana@changayees.com', role: 'Content Manager' },
];

async function seedManagers(): Promise<Record<string, string>> {
  const roles = await prisma.role.findMany();
  const roleByName = new Map(roles.map((r) => [r.name, r.id]));
  const passwordHash = await bcrypt.hash('ChangeMe!2026', 12);
  const byRole: Record<string, string> = {};

  for (const m of MANAGERS) {
    const roleId = roleByName.get(m.role);
    if (!roleId) continue;
    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        phone: '+91 98765 4' + Math.floor(1000 + Math.random() * 8999),
        passwordHash,
        roleId,
        status: RecordStatus.ACTIVE,
        lastLogin: hoursAgo(Math.floor(Math.random() * 48)),
      },
    });
    byRole[m.role] = user.id;
  }
  log(`managers: ${Object.keys(byRole).length} (password: ChangeMe!2026)`);
  return byRole;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

type ProductSeed = {
  category: string; // category slug
  sub?: string; // subcategory slug
  name: string;
  slug: string;
  short: string;
  description: string;
  fabric: string;
  moq: number;
  sizes: string[];
  colors: string[];
  featured?: boolean;
  status?: PublishStatus;
};

const STD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRODUCTS: ProductSeed[] = [
  // School
  {
    category: 'school-uniforms',
    sub: 'school-shirts',
    name: 'White School Shirt — Half Sleeve',
    slug: 'white-school-shirt-half-sleeve',
    short: 'Crisp poly-cotton half-sleeve shirt for daily school wear.',
    description:
      'A durable, easy-care half-sleeve school shirt in bright white. Woven from a 65/35 poly-cotton blend that resists shrinkage and holds colour wash after wash. Reinforced stitching at stress points and a neat school collar. Available in bulk with optional embroidered school logo.',
    fabric: 'Poly-Cotton 65/35',
    moq: 50,
    sizes: ['20', '22', '24', '26', '28', '30', '32', '34'],
    colors: ['White', 'Sky Blue', 'Cream'],
    featured: true,
  },
  {
    category: 'school-uniforms',
    sub: 'school-trousers',
    name: 'Grey School Trouser',
    slug: 'grey-school-trouser',
    short: 'Hard-wearing grey trouser with adjustable waist.',
    description:
      'Mid-grey school trouser tailored from a wrinkle-resistant poly-viscose blend. Features an adjustable elastic waistband, double-stitched seams, and a reinforced knee panel for active students. Colour-fast and machine washable.',
    fabric: 'Poly-Viscose',
    moq: 50,
    sizes: ['24', '26', '28', '30', '32', '34', '36'],
    colors: ['Grey', 'Charcoal', 'Navy'],
  },
  {
    category: 'school-uniforms',
    sub: 'school-pinafores',
    name: 'Navy Box-Pleat Pinafore',
    slug: 'navy-box-pleat-pinafore',
    short: 'Classic box-pleat pinafore for junior girls.',
    description:
      'A timeless navy pinafore with crisp box pleats and an adjustable bib. Made from a sturdy poly-cotton twill that keeps its shape through repeated laundering. Side zip and adjustable straps for a growing fit.',
    fabric: 'Poly-Cotton Twill',
    moq: 40,
    sizes: ['22', '24', '26', '28', '30'],
    colors: ['Navy', 'Maroon', 'Bottle Green'],
    featured: true,
  },
  {
    category: 'school-uniforms',
    sub: 'school-blazers',
    name: 'School Blazer — Navy',
    slug: 'school-blazer-navy',
    short: 'Structured navy blazer with school crest option.',
    description:
      'A smart, structured navy blazer in a warm poly-wool blend. Notch lapel, two-button front, and an inner pocket. Supplied with optional woven crest and contrast piping in your school colours.',
    fabric: 'Poly-Wool Blend',
    moq: 30,
    sizes: STD_SIZES,
    colors: ['Navy', 'Black', 'Bottle Green'],
  },
  // College
  {
    category: 'college-uniforms',
    sub: 'college-shirts',
    name: 'College Formal Shirt',
    slug: 'college-formal-shirt',
    short: 'Smart full-sleeve formal shirt for college wear.',
    description:
      'A tailored full-sleeve formal shirt in a soft, breathable cotton-rich weave. Cut for a modern fit with a structured collar and adjustable cuffs. Ideal for college uniforms and front-office staff.',
    fabric: 'Cotton-Rich',
    moq: 50,
    sizes: STD_SIZES,
    colors: ['White', 'Light Blue', 'Pin Stripe'],
    featured: true,
  },
  {
    category: 'college-uniforms',
    sub: 'college-trousers',
    name: 'College Formal Trouser',
    slug: 'college-formal-trouser',
    short: 'Flat-front formal trouser with a clean drape.',
    description:
      'A flat-front formal trouser in a stretch poly-viscose that moves with you. Crease-retentive, colour-fast, and finished with a hook-and-bar closure and belt loops.',
    fabric: 'Stretch Poly-Viscose',
    moq: 50,
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    colors: ['Black', 'Charcoal', 'Beige'],
  },
  {
    category: 'college-uniforms',
    sub: 'college-blazers',
    name: 'College Blazer',
    slug: 'college-blazer',
    short: 'Single-breasted blazer for departments and events.',
    description:
      'A single-breasted college blazer with a clean silhouette and durable lining. Available with embroidered department badges and contrast trims for house or department identity.',
    fabric: 'Poly-Wool Blend',
    moq: 25,
    sizes: STD_SIZES,
    colors: ['Navy', 'Maroon', 'Grey'],
  },
  // Uniform Sarees
  {
    category: 'uniform-sarees',
    sub: 'cotton-sarees',
    name: 'Cotton Uniform Saree',
    slug: 'cotton-uniform-saree',
    short: 'Breathable cotton saree for institutional staff.',
    description:
      'A comfortable, breathable cotton uniform saree designed for all-day wear. Colour-fast dyes and a soft finish make it ideal for school teachers, hospital staff, and front-desk teams. Supplied with matching blouse piece.',
    fabric: '100% Cotton',
    moq: 30,
    sizes: ['Free Size'],
    colors: ['Maroon', 'Teal', 'Mustard', 'Navy'],
    featured: true,
  },
  {
    category: 'uniform-sarees',
    sub: 'silk-blend-sarees',
    name: 'Silk-Blend Uniform Saree',
    slug: 'silk-blend-uniform-saree',
    short: 'Premium silk-blend saree with a subtle sheen.',
    description:
      'A premium silk-blend uniform saree with a refined drape and gentle sheen — well suited to hospitality and corporate front-office roles. Easy to maintain with a soft, non-itch finish.',
    fabric: 'Silk-Cotton Blend',
    moq: 25,
    sizes: ['Free Size'],
    colors: ['Wine', 'Emerald', 'Royal Blue'],
  },
  // Corporate
  {
    category: 'corporate-uniforms',
    sub: 'corporate-shirts',
    name: 'Corporate Formal Shirt',
    slug: 'corporate-formal-shirt',
    short: 'Wrinkle-resistant formal shirt for office teams.',
    description:
      'A wrinkle-resistant corporate formal shirt with a tailored fit and a smart spread collar. Engineered for all-day comfort with moisture-wicking yarns. Embroidered logo and name badges available.',
    fabric: 'Cotton-Poly Easy-Care',
    moq: 50,
    sizes: STD_SIZES,
    colors: ['White', 'Sky Blue', 'Light Grey', 'Lavender'],
    featured: true,
  },
  {
    category: 'corporate-uniforms',
    sub: 'corporate-blazers',
    name: 'Corporate Blazer',
    slug: 'corporate-blazer',
    short: 'Sharp tailored blazer for client-facing staff.',
    description:
      'A sharply tailored corporate blazer with a modern cut and durable inner construction. A professional finish for reception, sales, and management teams, with optional logo embroidery on the chest pocket.',
    fabric: 'Poly-Wool Blend',
    moq: 25,
    sizes: STD_SIZES,
    colors: ['Charcoal', 'Navy', 'Black'],
  },
  {
    category: 'corporate-uniforms',
    sub: 'corporate-trousers',
    name: 'Corporate Formal Trouser',
    slug: 'corporate-formal-trouser',
    short: 'Comfort-stretch formal trouser for daily wear.',
    description:
      'A comfort-stretch corporate trouser with a clean flat front and crease retention. Finished with a curtain waistband for comfort during long shifts.',
    fabric: 'Stretch Poly-Viscose',
    moq: 50,
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    colors: ['Black', 'Charcoal', 'Navy'],
  },
  // Sports
  {
    category: 'sports-uniforms',
    sub: 'sports-tshirts',
    name: 'Dri-Fit Sports T-Shirt',
    slug: 'dri-fit-sports-tshirt',
    short: 'Moisture-wicking tee for PE and sports days.',
    description:
      'A lightweight, moisture-wicking sports T-shirt that keeps students cool and dry. Quick-drying micro-polyester with flatlock seams to prevent chafing. Sublimation printing available for house colours and logos.',
    fabric: 'Micro-Polyester',
    moq: 50,
    sizes: STD_SIZES,
    colors: ['Red', 'Royal Blue', 'Green', 'Yellow', 'Black'],
    featured: true,
  },
  {
    category: 'sports-uniforms',
    sub: 'sports-track-pants',
    name: 'Sports Track Pants',
    slug: 'sports-track-pants',
    short: 'Stretch track pants with side pockets.',
    description:
      'Comfortable stretch track pants with an elastic drawcord waist and side pockets. Breathable, quick-drying fabric for training and athletics. Contrast side stripes in school colours available.',
    fabric: 'Polyester-Spandex',
    moq: 50,
    sizes: STD_SIZES,
    colors: ['Navy', 'Black', 'Grey'],
  },
  {
    category: 'sports-uniforms',
    sub: 'sports-jerseys',
    name: 'Team Jersey',
    slug: 'team-jersey',
    short: 'Sublimated team jersey, fully customisable.',
    description:
      'A fully customisable sublimated team jersey — add names, numbers, sponsor logos, and house colours edge to edge. Lightweight breathable knit built for match-day performance.',
    fabric: 'Performance Knit',
    moq: 20,
    sizes: STD_SIZES,
    colors: ['Custom'],
  },
  // Lab Coats
  {
    category: 'lab-coats',
    sub: 'lab-coats-full-sleeve',
    name: 'Full-Sleeve Lab Coat',
    slug: 'full-sleeve-lab-coat',
    short: 'Classic full-sleeve coat for labs and clinics.',
    description:
      'A classic full-sleeve white lab coat in a sturdy poly-cotton drill. Three pockets, a back belt, and reinforced buttons. Ideal for laboratories, clinics, pharmacies, and science departments. Logo embroidery available.',
    fabric: 'Poly-Cotton Drill',
    moq: 25,
    sizes: STD_SIZES,
    colors: ['White'],
    featured: true,
  },
  {
    category: 'lab-coats',
    sub: 'lab-coats-half-sleeve',
    name: 'Half-Sleeve Lab Coat',
    slug: 'half-sleeve-lab-coat',
    short: 'Cooler half-sleeve coat for warm environments.',
    description:
      'A cooler half-sleeve lab coat for warm working environments. Same durable poly-cotton drill and practical pocket layout as the full-sleeve, with a lighter feel.',
    fabric: 'Poly-Cotton Drill',
    moq: 25,
    sizes: STD_SIZES,
    colors: ['White', 'Light Blue'],
  },
  // Accessories
  {
    category: 'accessories',
    sub: 'accessories-caps',
    name: 'School Cap',
    slug: 'school-cap',
    short: 'Cotton twill cap with embroidered crest option.',
    description:
      'A cotton twill school cap with an adjustable strap and optional embroidered crest. Colour-fast and comfortable for daily outdoor wear.',
    fabric: 'Cotton Twill',
    moq: 100,
    sizes: ['Free Size'],
    colors: ['Navy', 'Maroon', 'Green'],
  },
  {
    category: 'accessories',
    sub: 'accessories-badges',
    name: 'Embroidered Badge',
    slug: 'embroidered-badge',
    short: 'Custom embroidered crest/badge, iron-on or sew-on.',
    description:
      'High-density embroidered badges produced to your artwork — school crests, house emblems, and corporate logos. Available iron-on or sew-on with colour-matched threads.',
    fabric: 'Embroidered Twill',
    moq: 200,
    sizes: ['Custom'],
    colors: ['Custom'],
    status: PublishStatus.DRAFT,
  },
  {
    category: 'accessories',
    sub: 'accessories-socks',
    name: 'Cotton Socks (Pack of 3)',
    slug: 'cotton-socks-pack-of-3',
    short: 'Soft combed-cotton socks with striped tops.',
    description:
      'Soft combed-cotton school socks with cushioned soles and colour-striped tops. Sold in packs of three. Reinforced heel and toe for longer life.',
    fabric: 'Combed Cotton',
    moq: 100,
    sizes: ['S', 'M', 'L'],
    colors: ['White', 'Grey', 'Navy'],
    status: PublishStatus.DRAFT,
  },
];

async function seedProducts(adminId: string): Promise<string[]> {
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const subcategories = await prisma.subcategory.findMany({ select: { id: true, slug: true } });
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const subBySlug = new Map(subcategories.map((s) => [s.slug, s.id]));

  const ids: string[] = [];
  let i = 0;
  for (const p of PRODUCTS) {
    i += 1;
    const categoryId = catBySlug.get(p.category);
    if (!categoryId) continue;
    const product = await prisma.product.create({
      data: {
        productCode: `CHG-${pad(i)}`,
        name: p.name,
        slug: p.slug,
        shortDescription: p.short,
        description: p.description,
        categoryId,
        subcategoryId: p.sub ? (subBySlug.get(p.sub) ?? null) : null,
        fabricType: p.fabric,
        moq: p.moq,
        availableSizes: p.sizes,
        availableColors: p.colors,
        isFeatured: p.featured ?? false,
        status: p.status ?? PublishStatus.PUBLISHED,
        createdBy: adminId,
        updatedBy: adminId,
        images: {
          create: [
            { imageUrl: img(`${p.slug}-1`), altText: `${p.name} — front`, sortOrder: 0 },
            { imageUrl: img(`${p.slug}-2`), altText: `${p.name} — detail`, sortOrder: 1 },
          ],
        },
        documents: {
          create: [
            {
              documentType: ProductDocumentType.SIZE_CHART,
              title: `${p.name} — Size Chart`,
              fileUrl: `https://picsum.photos/seed/chg-${p.slug}-doc/600/800`,
            },
          ],
        },
      },
    });
    ids.push(product.id);
  }
  const published = PRODUCTS.filter((p) => (p.status ?? PublishStatus.PUBLISHED) === PublishStatus.PUBLISHED).length;
  log(`products: ${ids.length} (${published} published, ${PRODUCTS.length - published} draft)`);
  return ids;
}

// ---------------------------------------------------------------------------
// Catalogs
// ---------------------------------------------------------------------------

const CATALOGS = [
  {
    title: 'School Uniforms 2026 Collection',
    slug: 'school-uniforms-2026',
    category: 'School',
    description:
      'Our complete range of school shirts, trousers, pinafores, blazers, and accessories with fabric and colour options.',
  },
  {
    title: 'Corporate Workwear Lookbook',
    slug: 'corporate-workwear-lookbook',
    category: 'Corporate',
    description:
      'Formal shirts, blazers, and trousers for client-facing and back-office teams, with branding options.',
  },
  {
    title: 'Healthcare & Lab Wear Catalog',
    slug: 'healthcare-lab-wear',
    category: 'Healthcare',
    description:
      'Lab coats, scrubs, and hospital staff uniforms built for hygiene, comfort, and durability.',
  },
  {
    title: 'Sports & Activewear Range',
    slug: 'sports-activewear-range',
    category: 'Sports',
    description:
      'Performance tees, track pants, and fully sublimated team jerseys for schools and clubs.',
  },
  {
    title: 'Changayees Master Catalog',
    slug: 'changayees-master-catalog',
    category: 'General',
    description:
      'The full Changayees product line across every category in a single reference document.',
  },
];

async function seedCatalogs() {
  for (const c of CATALOGS) {
    await prisma.catalog.create({
      data: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        category: c.category,
        thumbnail: img(`cat-${c.slug}`, 600, 800),
        fileUrl: `https://picsum.photos/seed/chg-cat-${c.slug}-pdf/600/800`,
        status: PublishStatus.PUBLISHED,
      },
    });
  }
  log(`catalogs: ${CATALOGS.length}`);
}

// ---------------------------------------------------------------------------
// Blogs
// ---------------------------------------------------------------------------

const BLOGS = [
  {
    title: 'How to Choose Durable School Uniform Fabric',
    slug: 'how-to-choose-durable-school-uniform-fabric',
    excerpt:
      'Poly-cotton, twill, or pure cotton? A practical guide to picking fabric that survives a full school year.',
    days: 3,
    status: PublishStatus.PUBLISHED,
  },
  {
    title: 'Bulk Uniform Procurement: A Buyer’s Checklist',
    slug: 'bulk-uniform-procurement-buyers-checklist',
    excerpt:
      'From sizing surveys to delivery timelines — the ten things every institution should confirm before placing a bulk order.',
    days: 9,
    status: PublishStatus.PUBLISHED,
  },
  {
    title: '5 Trends Shaping Corporate Workwear in 2026',
    slug: 'corporate-workwear-trends-2026',
    excerpt:
      'Stretch fabrics, sustainable yarns, and subtle branding — what is changing in office uniforms this year.',
    days: 16,
    status: PublishStatus.PUBLISHED,
  },
  {
    title: 'Caring for Institutional Uniforms: A Maintenance Guide',
    slug: 'caring-for-institutional-uniforms',
    excerpt:
      'Simple washing and storage practices that keep colours bright and fabric strong, order after order.',
    days: 24,
    status: PublishStatus.PUBLISHED,
  },
  {
    title: 'Behind the Scenes: Our 15-Stage Production Workflow',
    slug: 'behind-the-scenes-production-workflow',
    excerpt:
      'A look at how a bulk order moves from fabric sourcing to dispatch — and how you can track every step.',
    days: 0,
    status: PublishStatus.DRAFT,
  },
];

const blogBody = (title: string) =>
  `## ${title}\n\nProcuring uniforms in bulk is as much about logistics as it is about cloth. In this guide we walk through the practical considerations that institutional buyers face, with examples drawn from real Changayees orders.\n\n### Why it matters\n\nThe right decision up front saves weeks of rework later. Fabric weight, colour-fastness, sizing tolerance, and delivery scheduling all compound across hundreds of garments.\n\n### What we recommend\n\n1. Start with a sizing survey before confirming quantities.\n2. Order a pre-production sample for sign-off.\n3. Lock fabric and colour against a physical swatch, not a screen.\n4. Build in a buffer for last-minute size changes.\n\n> Tip: Request a quotation early so production capacity can be reserved against your target date.\n\nNeed help planning your next order? Submit an RFQ and our team will get back within one business day.`;

async function seedBlogs(adminId: string) {
  for (const b of BLOGS) {
    await prisma.blog.create({
      data: {
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: blogBody(b.title),
        featuredImage: img(`blog-${b.slug}`, 1200, 630),
        seoTitle: `${b.title} — Changayees Blog`,
        seoDescription: b.excerpt,
        status: b.status,
        publishedAt:
          b.status === PublishStatus.PUBLISHED ? daysAgo(b.days) : null,
        createdBy: adminId,
        updatedBy: adminId,
        createdAt: daysAgo(b.days + 1),
      },
    });
  }
  log(`blogs: ${BLOGS.length}`);
}

// ---------------------------------------------------------------------------
// Case studies
// ---------------------------------------------------------------------------

const CASE_STUDIES = [
  {
    title: 'Outfitting 2,400 Students for a CBSE School Chain',
    slug: 'cbse-school-chain-2400-students',
    industry: 'schools',
    client: 'Vidya Vikas Group of Schools',
    location: 'Coimbatore, Tamil Nadu',
    challenge:
      'A four-campus school chain needed a consistent uniform across 2,400 students before the new academic year — with tight sizing accuracy and a single delivery window.',
    solution:
      'We ran on-site sizing camps at each campus, locked fabric against approved swatches, and produced in staggered batches mapped to our 15-stage workflow so the principal could track progress live.',
    results:
      'All four campuses received complete, correctly-sized uniforms three days ahead of the deadline, with a sub-1% reorder rate for size exchanges.',
  },
  {
    title: 'Hospital Staff Uniforms with Strict Hygiene Standards',
    slug: 'hospital-staff-uniforms-hygiene',
    industry: 'hospitals',
    client: 'Sri Ramakrishna Multispeciality Hospital',
    location: 'Chennai, Tamil Nadu',
    challenge:
      'A 600-bed hospital required colour-coded uniforms across departments, built to withstand repeated high-temperature laundering without fading.',
    solution:
      'We selected an anti-microbial poly-cotton drill, assigned a distinct colourway per department, and embroidered role badges for quick identification.',
    results:
      'Department identification improved at a glance, and the fabric held colour through 80+ industrial wash cycles in testing.',
  },
  {
    title: 'Front-Office Refresh for a Boutique Hotel Group',
    slug: 'boutique-hotel-front-office-refresh',
    industry: 'hotels',
    client: 'The Coromandel Collection',
    location: 'Pondicherry',
    challenge:
      'A boutique hotel group wanted a premium, photo-ready uniform for front-office and concierge staff that still held up to daily wear.',
    solution:
      'We paired silk-blend sarees and tailored blazers with subtle tonal branding, producing fit samples for each role before the full run.',
    results:
      'Guest-facing staff received a cohesive, premium look, delivered across three properties in a single coordinated dispatch.',
  },
  {
    title: 'Standardised Workwear for a Manufacturing Plant',
    slug: 'manufacturing-plant-standardised-workwear',
    industry: 'industrial',
    client: 'Annapoorna Industries',
    location: 'Tiruppur, Tamil Nadu',
    challenge:
      'A manufacturing plant needed rugged, safe workwear for 800 floor staff with clear shift and zone identification.',
    solution:
      'We supplied heavy-duty drill uniforms with reflective piping and zone-coded colours, sized via an on-site fitting drive.',
    results:
      'Floor supervisors reported faster zone identification and the uniforms withstood a full shift cycle without seam failures.',
  },
];

async function seedCaseStudies() {
  const industries = await prisma.industry.findMany({ select: { id: true, slug: true } });
  const indBySlug = new Map(industries.map((i) => [i.slug, i.id]));
  for (const c of CASE_STUDIES) {
    await prisma.caseStudy.create({
      data: {
        title: c.title,
        slug: c.slug,
        industryId: indBySlug.get(c.industry) ?? null,
        clientName: c.client,
        location: c.location,
        challenge: c.challenge,
        solution: c.solution,
        results: c.results,
        featuredImage: img(`case-${c.slug}`, 1200, 630),
        status: PublishStatus.PUBLISHED,
      },
    });
  }
  log(`case studies: ${CASE_STUDIES.length}`);
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

const TESTIMONIALS = [
  {
    name: 'Lakshmi Narayanan',
    organization: 'Vidya Vikas Group of Schools',
    designation: 'Administrative Head',
    testimonial:
      'Changayees handled 2,400 uniforms across four campuses without a single missed deadline. The live order tracking gave us complete peace of mind.',
  },
  {
    name: 'Dr. Meera Krishnan',
    organization: 'Sri Ramakrishna Hospital',
    designation: 'HR Director',
    testimonial:
      'The colour-coded department uniforms have held up beautifully through heavy laundering. Quality and consistency have been excellent.',
  },
  {
    name: 'Rahul Verma',
    organization: 'The Coromandel Collection',
    designation: 'General Manager',
    testimonial:
      'Our front-office team looks genuinely premium now. The fit samples before the full run made all the difference.',
  },
  {
    name: 'Sundar Rajan',
    organization: 'Annapoorna Industries',
    designation: 'Plant Operations Manager',
    testimonial:
      'Rugged, well-made workwear delivered on time for 800 staff. The on-site fitting drive saved us enormous hassle.',
  },
  {
    name: 'Anita Desai',
    organization: 'Bright Future College',
    designation: 'Principal',
    testimonial:
      'Responsive team, fair pricing, and a smooth bulk ordering process from quote to delivery. Highly recommended.',
  },
];

async function seedTestimonials() {
  let i = 0;
  for (const t of TESTIMONIALS) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        organization: t.organization,
        designation: t.designation,
        testimonial: t.testimonial,
        photo: img(`person-${i}`, 200, 200),
        status: PublishStatus.PUBLISHED,
        sortOrder: i,
      },
    });
    i += 1;
  }
  log(`testimonials: ${TESTIMONIALS.length}`);
}

// ---------------------------------------------------------------------------
// Leads + contact requests
// ---------------------------------------------------------------------------

const LEADS = [
  { name: 'Ganesh Iyer', org: 'Little Flowers School', industry: 'schools', source: LeadSource.RFQ, status: LeadStatus.QUOTATION_SENT },
  { name: 'Fatima Sheikh', org: 'Crescent College', industry: 'colleges', source: LeadSource.PRODUCT_INQUIRY, status: LeadStatus.CONTACTED },
  { name: 'Dr. Ravi Kumar', org: 'CityCare Hospital', industry: 'hospitals', source: LeadSource.CONTACT_FORM, status: LeadStatus.NEW },
  { name: 'Priyanka Joshi', org: 'Grand Bay Hotel', industry: 'hotels', source: LeadSource.CATALOG_DOWNLOAD, status: LeadStatus.NEW },
  { name: 'Mohammed Ali', org: 'Apex Corp Services', industry: 'corporate', source: LeadSource.BULK_ORDER, status: LeadStatus.NEGOTIATION },
  { name: 'Sneha Pillai', org: 'Sunrise Public School', industry: 'schools', source: LeadSource.WHATSAPP, status: LeadStatus.WON },
  { name: 'Vikram Singh', org: 'Metro Manufacturing', industry: 'industrial', source: LeadSource.RFQ, status: LeadStatus.LOST },
  { name: 'Deepa Raman', org: 'Greenwood Academy', industry: 'schools', source: LeadSource.PRODUCT_INQUIRY, status: LeadStatus.NEW },
  { name: 'Arun Prakash', org: 'TechNova Solutions', industry: 'corporate', source: LeadSource.CONTACT_FORM, status: LeadStatus.CONTACTED },
  { name: 'Nisha Thomas', org: 'Seaview Resorts', industry: 'hotels', source: LeadSource.CATALOG_DOWNLOAD, status: LeadStatus.QUOTATION_SENT },
  { name: 'Balaji Subramani', org: 'St. Xavier College', industry: 'colleges', source: LeadSource.BULK_ORDER, status: LeadStatus.NEGOTIATION },
  { name: 'Reshma Khan', org: 'Wellness Clinic', industry: 'hospitals', source: LeadSource.WHATSAPP, status: LeadStatus.NEW },
];

async function seedLeads(salesManagerId?: string): Promise<string[]> {
  const industries = await prisma.industry.findMany({ select: { id: true, slug: true } });
  const indBySlug = new Map(industries.map((i) => [i.slug, i.id]));
  const ids: string[] = [];
  let i = 0;
  for (const l of LEADS) {
    i += 1;
    const ts = (Date.now() + i).toString(36).toUpperCase();
    const lead = await prisma.lead.create({
      data: {
        leadNumber: `LEAD-${ts}-${100 + i}`,
        name: l.name,
        phone: `+9198${pad(7600 + i)}${pad(2300 + i)}`.slice(0, 13),
        email: `${l.name.split(' ')[0].toLowerCase()}@${l.org.toLowerCase().replace(/[^a-z]+/g, '')}.example.com`,
        organization: l.org,
        designation: 'Procurement Lead',
        industryId: indBySlug.get(l.industry) ?? null,
        source: l.source,
        status: l.status,
        assignedTo:
          l.status === LeadStatus.NEW ? null : (salesManagerId ?? null),
        notes:
          l.status === LeadStatus.QUOTATION_SENT
            ? 'Quotation emailed; awaiting confirmation on sizing breakdown.'
            : l.status === LeadStatus.NEGOTIATION
              ? 'Negotiating unit price for a 500+ piece order.'
              : null,
        consentWhatsapp: i % 2 === 0,
        createdAt: daysAgo(i),
      },
    });
    ids.push(lead.id);
  }
  log(`leads: ${LEADS.length}`);
  return ids;
}

async function seedContactRequests(leadIds: string[]) {
  const samples = [
    { name: 'Dr. Ravi Kumar', org: 'CityCare Hospital', message: 'We need 350 lab coats and scrubs for our new wing. Please share pricing and lead time.' },
    { name: 'Priyanka Joshi', org: 'Grand Bay Hotel', message: 'Looking for front-office uniforms for 60 staff across two properties. Can we get samples?' },
    { name: 'Arun Prakash', org: 'TechNova Solutions', message: 'Interested in corporate shirts with embroidered logo for ~200 employees.' },
    { name: 'Walk-in Enquiry', org: 'Rainbow Play School', message: 'Small order — 80 pinafores and shirts. What is your minimum order quantity?' },
  ];
  let i = 0;
  for (const c of samples) {
    await prisma.contactRequest.create({
      data: {
        name: c.name,
        phone: `+9197${pad(1200 + i)}${pad(8800 + i)}`.slice(0, 13),
        email: `${c.name.split(' ')[0].toLowerCase()}@example.com`,
        organization: c.org,
        message: c.message,
        leadId: i < leadIds.length ? leadIds[i + 2] ?? null : null,
        createdAt: hoursAgo(i * 6 + 2),
      },
    });
    i += 1;
  }
  log(`contact requests: ${samples.length}`);
}

// ---------------------------------------------------------------------------
// RFQs
// ---------------------------------------------------------------------------

async function seedRfqs(productIds: string[], salesManagerId?: string) {
  const industries = await prisma.industry.findMany({ select: { id: true, slug: true } });
  const indBySlug = new Map(industries.map((i) => [i.slug, i.id]));

  const rfqs = [
    {
      type: RfqType.RFQ,
      org: 'Little Flowers School',
      contact: 'Ganesh Iyer',
      industry: 'schools',
      location: 'Madurai, Tamil Nadu',
      status: RfqStatus.QUOTATION_SENT,
      requirements: 'Full school uniform set for grades 1–10. Need shirts, trousers, pinafores, and ties with embroidered crest.',
      studentCount: 1200,
      qty: 3600,
      items: [
        { label: 'White School Shirt — Half Sleeve', qty: 1200 },
        { label: 'Grey School Trouser', qty: 800 },
        { label: 'Navy Box-Pleat Pinafore', qty: 400 },
      ],
      withFile: true,
    },
    {
      type: RfqType.BULK,
      org: 'Apex Corp Services',
      contact: 'Mohammed Ali',
      industry: 'corporate',
      location: 'Bengaluru, Karnataka',
      status: RfqStatus.UNDER_REVIEW,
      requirements: 'Corporate formal shirts and blazers for client-facing staff. Logo embroidery on chest pocket required.',
      staffCount: 220,
      qty: 660,
      items: [
        { label: 'Corporate Formal Shirt', qty: 440 },
        { label: 'Corporate Blazer', qty: 220 },
      ],
      withFile: false,
    },
    {
      type: RfqType.RFQ,
      org: 'CityCare Hospital',
      contact: 'Dr. Ravi Kumar',
      industry: 'hospitals',
      location: 'Chennai, Tamil Nadu',
      status: RfqStatus.SUBMITTED,
      requirements: 'Department-coded lab coats and scrubs. Anti-microbial fabric preferred.',
      staffCount: 350,
      qty: 700,
      items: [
        { label: 'Full-Sleeve Lab Coat', qty: 350 },
        { label: 'Half-Sleeve Lab Coat', qty: 350 },
      ],
      withFile: true,
    },
    {
      type: RfqType.BULK,
      org: 'St. Xavier College',
      contact: 'Balaji Subramani',
      industry: 'colleges',
      location: 'Kochi, Kerala',
      status: RfqStatus.APPROVED,
      requirements: 'College formal shirts and blazers for first-year students across departments.',
      studentCount: 900,
      qty: 1800,
      items: [
        { label: 'College Formal Shirt', qty: 900 },
        { label: 'College Blazer', qty: 900 },
      ],
      withFile: false,
    },
    {
      type: RfqType.RFQ,
      org: 'Seaview Resorts',
      contact: 'Nisha Thomas',
      industry: 'hotels',
      location: 'Goa',
      status: RfqStatus.CLOSED,
      requirements: 'Premium silk-blend sarees and blazers for front-office staff.',
      staffCount: 60,
      qty: 120,
      items: [{ label: 'Silk-Blend Uniform Saree', qty: 60 }],
      withFile: false,
    },
    {
      type: RfqType.BULK,
      org: 'Metro Manufacturing',
      contact: 'Vikram Singh',
      industry: 'industrial',
      location: 'Tiruppur, Tamil Nadu',
      status: RfqStatus.REJECTED,
      requirements: 'Heavy-duty workwear with reflective piping for 800 floor staff.',
      staffCount: 800,
      qty: 1600,
      items: [{ label: 'Custom industrial workwear (drill)', qty: 1600 }],
      withFile: false,
    },
  ];

  let i = 0;
  for (const r of rfqs) {
    i += 1;
    const suffix = (Date.now() + i).toString(36).slice(-6).toUpperCase();
    await prisma.rfq.create({
      data: {
        rfqNumber: `RFQ-${YEAR}-${suffix}`,
        type: r.type,
        organization: r.org,
        contactPerson: r.contact,
        phone: `+9196${pad(3300 + i)}${pad(1100 + i)}`.slice(0, 13),
        email: `${r.contact.split(' ').pop()!.toLowerCase()}@${r.org.toLowerCase().replace(/[^a-z]+/g, '')}.example.com`,
        location: r.location,
        industryId: indBySlug.get(r.industry) ?? null,
        requirements: r.requirements,
        expectedQuantity: r.qty,
        studentCount: r.studentCount ?? null,
        staffCount: r.staffCount ?? null,
        expectedDelivery: daysAgo(-30 - i * 5),
        status: r.status,
        assignedTo:
          r.status === RfqStatus.SUBMITTED ? null : (salesManagerId ?? null),
        consentWhatsapp: i % 2 === 1,
        createdAt: daysAgo(i * 2),
        items: {
          create: r.items.map((it, idx) => ({
            // Link the first item to a real product where possible; rest as free text.
            productId: idx === 0 && productIds[idx] ? productIds[idx] : null,
            customLabel: it.label,
            quantity: it.qty,
          })),
        },
        files: r.withFile
          ? {
              create: [
                {
                  fileUrl: `https://picsum.photos/seed/chg-rfq-${i}/600/800`,
                  fileName: 'requirement-sheet.pdf',
                  fileType: 'application/pdf',
                  fileSize: 248_000,
                },
              ],
            }
          : undefined,
      },
    });
  }
  log(`rfqs: ${rfqs.length}`);
}

// ---------------------------------------------------------------------------
// Orders (with production timeline + tracking links)
// ---------------------------------------------------------------------------

async function seedOrders(productIds: string[], orderManagerId?: string, prodManagerId?: string) {
  const orders = [
    { customer: 'Ganesh Iyer', org: 'Little Flowers School', status: OrderStatus.STITCHING_STARTED, items: [{ label: 'White School Shirt — Half Sleeve', qty: 1200 }, { label: 'Grey School Trouser', qty: 800 }] },
    { customer: 'Balaji Subramani', org: 'St. Xavier College', status: OrderStatus.FABRIC_RECEIVED, items: [{ label: 'College Formal Shirt', qty: 900 }, { label: 'College Blazer', qty: 900 }] },
    { customer: 'Lakshmi Narayanan', org: 'Vidya Vikas Group', status: OrderStatus.DELIVERED, items: [{ label: 'School Blazer — Navy', qty: 600 }] },
    { customer: 'Dr. Meera Krishnan', org: 'Sri Ramakrishna Hospital', status: OrderStatus.QUALITY_INSPECTION, items: [{ label: 'Full-Sleeve Lab Coat', qty: 350 }, { label: 'Half-Sleeve Lab Coat', qty: 350 }] },
    { customer: 'Rahul Verma', org: 'The Coromandel Collection', status: OrderStatus.DISPATCHED, items: [{ label: 'Silk-Blend Uniform Saree', qty: 60 }] },
    { customer: 'Mohammed Ali', org: 'Apex Corp Services', status: OrderStatus.ORDER_CONFIRMED, items: [{ label: 'Corporate Formal Shirt', qty: 440 }, { label: 'Corporate Blazer', qty: 220 }] },
    { customer: 'Sneha Pillai', org: 'Sunrise Public School', status: OrderStatus.CLOSED, items: [{ label: 'Dri-Fit Sports T-Shirt', qty: 500 }] },
    { customer: 'Deepa Raman', org: 'Greenwood Academy', status: OrderStatus.INQUIRY_RECEIVED, items: [{ label: 'Navy Box-Pleat Pinafore', qty: 300 }] },
  ];

  let i = 0;
  for (const o of orders) {
    i += 1;
    const seq = `${(Date.now() + i).toString(36).slice(-5)}${10 + i}`.toUpperCase();
    const targetIndex = ORDER_SEQUENCE.indexOf(o.status);
    const createdDaysAgo = 20 + i;

    // Build the append-only history from INQUIRY_RECEIVED up to the current status.
    const history = ORDER_SEQUENCE.slice(0, targetIndex + 1).map((status, idx) => ({
      status,
      internalNote: `Stage updated to ${status}.`,
      customerNote:
        status === OrderStatus.DISPATCHED
          ? 'Your order has been dispatched and is on its way.'
          : status === OrderStatus.DELIVERED
            ? 'Order delivered. Thank you for choosing Changayees!'
            : null,
      updatedBy: prodManagerId ?? orderManagerId ?? null,
      createdAt: daysAgo(createdDaysAgo - idx),
    }));

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${YEAR}-${seq}`,
        trackingId: `CHG-${YEAR}-${seq}`,
        customerName: o.customer,
        organization: o.org,
        phone: `+9195${pad(4400 + i)}${pad(2200 + i)}`.slice(0, 13),
        email: `${o.customer.split(' ').pop()!.toLowerCase()}@${o.org.toLowerCase().replace(/[^a-z]+/g, '')}.example.com`,
        assignedManager: orderManagerId ?? null,
        expectedDelivery: daysAgo(-15 + i),
        currentStatus: o.status,
        progressPercentage: progressFor(o.status),
        consentWhatsapp: true,
        createdBy: orderManagerId ?? null,
        createdAt: daysAgo(createdDaysAgo),
        items: {
          create: o.items.map((it, idx) => ({
            productId: productIds[idx] ?? null,
            itemLabel: it.label,
            quantity: it.qty,
          })),
        },
        statusHistory: { create: history },
        customerNotes: {
          create: [
            {
              message: 'Sizing breakdown confirmed and locked for production.',
              visibleToCustomer: true,
              createdBy: orderManagerId ?? null,
              createdAt: daysAgo(createdDaysAgo - 1),
            },
          ],
        },
        trackingLink: {
          create: {
            trackingToken: crypto.randomBytes(24).toString('hex'),
            isActive: true,
          },
        },
        whatsappNotifications:
          targetIndex >= ORDER_SEQUENCE.indexOf(OrderStatus.DISPATCHED)
            ? {
                create: [
                  {
                    phone: `+9195${pad(4400 + i)}${pad(2200 + i)}`.slice(0, 13),
                    templateName: 'order_dispatched',
                    message: 'Your Changayees order has been dispatched.',
                    status: NotificationStatus.DELIVERED,
                    sentAt: daysAgo(2),
                  },
                ],
              }
            : undefined,
      },
    });
  }
  log(`orders: ${orders.length} (across the production workflow, with tracking links)`);
}

// ---------------------------------------------------------------------------
// CMS pages + media
// ---------------------------------------------------------------------------

async function seedPages(adminId: string) {
  const pages = [
    {
      title: 'Frequently Asked Questions',
      slug: 'faq',
      content:
        '## FAQ\n\n**What is your minimum order quantity?**\nMOQ varies by product, typically 25–100 pieces. See each product page for details.\n\n**Do you offer logo embroidery?**\nYes — most garments support embroidered crests, badges, and corporate logos.\n\n**How long does a bulk order take?**\nTypically 3–5 weeks depending on quantity and customisation. You can track every stage live.',
    },
    {
      title: 'Shipping & Delivery',
      slug: 'shipping-delivery',
      content:
        '## Shipping & Delivery\n\nWe deliver across India. Bulk orders are dispatched in coordinated batches mapped to your target date. Each order includes a live tracking link covering all 15 production stages from fabric sourcing to delivery.',
    },
  ];
  for (const p of pages) {
    await prisma.page.create({
      data: {
        title: p.title,
        slug: p.slug,
        content: p.content,
        seoTitle: `${p.title} — Changayees`,
        seoDescription: p.content.slice(0, 150),
        status: PublishStatus.PUBLISHED,
        updatedBy: adminId,
      },
    });
  }
  log(`pages: ${pages.length}`);
}

async function seedMedia(adminId: string) {
  const files = [
    'school-uniform-hero.jpg',
    'corporate-collection.jpg',
    'lab-coat-detail.jpg',
    'sports-jersey.jpg',
    'saree-range.jpg',
    'factory-floor.jpg',
  ];
  let i = 0;
  for (const f of files) {
    i += 1;
    await prisma.media.create({
      data: {
        fileName: f,
        fileUrl: img(`media-${i}`, 1200, 800),
        fileType: 'image/jpeg',
        fileSize: 180_000 + i * 12_000,
        folder: '/demo',
        uploadedBy: adminId,
      },
    });
  }
  log(`media: ${files.length}`);
}

// ---------------------------------------------------------------------------
// Analytics events (spread over the last 14 days)
// ---------------------------------------------------------------------------

async function seedAnalytics() {
  const names = [
    'product_viewed',
    'product_viewed',
    'product_viewed',
    'rfq_submitted',
    'catalog_downloaded',
    'whatsapp_clicked',
    'tracking_viewed',
    'lead_created',
  ];
  const rows: { eventName: string; eventType: string; userIdentifier: string; createdAt: Date }[] = [];
  for (let day = 0; day < 14; day += 1) {
    const count = 8 + Math.floor(Math.random() * 12);
    for (let k = 0; k < count; k += 1) {
      const name = names[Math.floor(Math.random() * names.length)];
      rows.push({
        eventName: name,
        eventType: name.includes('view') ? 'view' : 'conversion',
        userIdentifier: `anon-${Math.floor(Math.random() * 400)}`,
        createdAt: hoursAgo(day * 24 + Math.floor(Math.random() * 24)),
      });
    }
  }
  await prisma.analyticsEvent.createMany({ data: rows });
  log(`analytics events: ${rows.length} (last 14 days)`);
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
  const clearOnly = process.argv.includes('--clear');

  if (clearOnly) {
    // eslint-disable-next-line no-console
    console.log('Clearing Changayees demo content…');
    await clearDemo();
    // eslint-disable-next-line no-console
    console.log('Demo content cleared.');
    return;
  }

  // eslint-disable-next-line no-console
  console.log('Seeding Changayees demo content…');

  const admin = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL }, select: { id: true } });
  if (!admin) {
    throw new Error(
      `Super admin (${SUPER_ADMIN_EMAIL}) not found. Run "npm run db:seed" first.`,
    );
  }

  // Fresh start so the seed is repeatable.
  await clearDemo();

  const managers = await seedManagers();
  const productIds = await seedProducts(admin.id);
  await seedCatalogs();
  await seedBlogs(admin.id);
  await seedCaseStudies();
  await seedTestimonials();
  const leadIds = await seedLeads(managers['Sales Manager']);
  await seedContactRequests(leadIds);
  await seedRfqs(productIds, managers['Sales Manager']);
  await seedOrders(productIds, managers['Order Manager'], managers['Production Manager']);
  await seedPages(admin.id);
  await seedMedia(admin.id);
  await seedAnalytics();

  // eslint-disable-next-line no-console
  console.log('Demo seed complete.');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
