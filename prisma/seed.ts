/**
 * Changayees — production seed (idempotent).
 *
 * Seeds reference / foundational data only (no marketing content, which is
 * CMS-managed):
 *   1. RBAC roles
 *   2. Permission catalog
 *   3. Role → permission mapping (per the API role matrix)
 *   4. Super-admin user (credentials from env, bcrypt-hashed)
 *   5. Product categories + subcategories
 *   6. Industries
 *   7. System settings
 *   8. Default SEO settings
 *
 * Safe to run repeatedly: every write is an upsert or skipDuplicates.
 * Run with: `npm run db:seed`
 */
import bcrypt from 'bcryptjs';
import { PrismaClient, RecordStatus } from '../src/generated/prisma';
import { PERMISSION_CATALOG } from '../src/lib/rbac/permissions';
import { ROLE_NAMES, expandRoleGrant } from '../src/lib/rbac/matrix';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// 1. Roles
// ---------------------------------------------------------------------------

const ROLES = [
  { name: 'Super Admin', description: 'Full access to all modules.' },
  { name: 'Sales Manager', description: 'Leads, RFQs, and orders.' },
  { name: 'Order Manager', description: 'Orders, tracking, notifications.' },
  {
    name: 'Production Manager',
    description: 'Order status updates and tracking.',
  },
  {
    name: 'Marketing Manager',
    description: 'Blogs, catalogs, case studies, testimonials.',
  },
  { name: 'Content Manager', description: 'CMS pages and media.' },
] as const;

// Permission catalog (modules -> actions) and the role grant matrix are the
// shared single source of truth in src/lib/rbac (also used at runtime).

// ---------------------------------------------------------------------------
// 4. Super admin
// ---------------------------------------------------------------------------

const SUPER_ADMIN = {
  name: process.env.SUPER_ADMIN_NAME ?? 'Changayees Admin',
  email: process.env.SUPER_ADMIN_EMAIL ?? 'admin@changayees.com',
  password: process.env.SUPER_ADMIN_PASSWORD ?? 'ChangeMe!2026',
};

// ---------------------------------------------------------------------------
// 5. Categories + subcategories (PRD catalog)
// ---------------------------------------------------------------------------

const CATEGORIES: {
  name: string;
  slug: string;
  sortOrder: number;
  subcategories: { name: string; slug: string }[];
}[] = [
  {
    name: 'School Uniforms',
    slug: 'school-uniforms',
    sortOrder: 1,
    subcategories: [
      { name: 'Shirts', slug: 'school-shirts' },
      { name: 'Trousers', slug: 'school-trousers' },
      { name: 'Pinafores', slug: 'school-pinafores' },
      { name: 'Blazers', slug: 'school-blazers' },
      { name: 'Ties & Belts', slug: 'school-ties-belts' },
    ],
  },
  {
    name: 'College Uniforms',
    slug: 'college-uniforms',
    sortOrder: 2,
    subcategories: [
      { name: 'Shirts', slug: 'college-shirts' },
      { name: 'Trousers', slug: 'college-trousers' },
      { name: 'Blazers', slug: 'college-blazers' },
    ],
  },
  {
    name: 'Uniform Sarees',
    slug: 'uniform-sarees',
    sortOrder: 3,
    subcategories: [
      { name: 'Cotton Sarees', slug: 'cotton-sarees' },
      { name: 'Silk Blend Sarees', slug: 'silk-blend-sarees' },
    ],
  },
  {
    name: 'Corporate Uniforms',
    slug: 'corporate-uniforms',
    sortOrder: 4,
    subcategories: [
      { name: 'Formal Shirts', slug: 'corporate-shirts' },
      { name: 'Blazers', slug: 'corporate-blazers' },
      { name: 'Trousers', slug: 'corporate-trousers' },
    ],
  },
  {
    name: 'Sports Uniforms',
    slug: 'sports-uniforms',
    sortOrder: 5,
    subcategories: [
      { name: 'T-Shirts', slug: 'sports-tshirts' },
      { name: 'Track Pants', slug: 'sports-track-pants' },
      { name: 'Jerseys', slug: 'sports-jerseys' },
    ],
  },
  {
    name: 'Lab Coats',
    slug: 'lab-coats',
    sortOrder: 6,
    subcategories: [
      { name: 'Full Sleeve', slug: 'lab-coats-full-sleeve' },
      { name: 'Half Sleeve', slug: 'lab-coats-half-sleeve' },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    sortOrder: 7,
    subcategories: [
      { name: 'Caps', slug: 'accessories-caps' },
      { name: 'Badges', slug: 'accessories-badges' },
      { name: 'Socks', slug: 'accessories-socks' },
    ],
  },
];

// ---------------------------------------------------------------------------
// 6. Industries (PRD)
// ---------------------------------------------------------------------------

const INDUSTRIES = [
  { name: 'Schools', slug: 'schools' },
  { name: 'Colleges', slug: 'colleges' },
  { name: 'Hospitals', slug: 'hospitals' },
  { name: 'Hotels', slug: 'hotels' },
  { name: 'Corporate', slug: 'corporate' },
  { name: 'Industrial', slug: 'industrial' },
] as const;

// ---------------------------------------------------------------------------
// 7. System settings
// ---------------------------------------------------------------------------

const SETTINGS: Record<string, string> = {
  company_name: 'Changayees',
  contact_phone: '',
  contact_email: 'sales@changayees.com',
  address: '',
  whatsapp_number: '',
  whatsapp_enabled: 'true',
  business_hours: 'Mon–Sat, 9:30 AM – 6:30 PM IST',
  social_facebook: '',
  social_instagram: '',
  social_linkedin: '',
};

// ---------------------------------------------------------------------------
// 8. Default SEO (global per page type; page_id = null)
// ---------------------------------------------------------------------------

const SEO_DEFAULTS: {
  pageType: string;
  metaTitle: string;
  metaDescription: string;
}[] = [
  {
    pageType: 'home',
    metaTitle: 'Changayees — Institutional Uniform Procurement',
    metaDescription:
      'Discover, request quotes, and track bulk institutional uniform orders. Mobile-first B2B procurement for schools, colleges, hospitals, hotels, and corporates.',
  },
  {
    pageType: 'product',
    metaTitle: '{product} — Bulk Uniform Procurement | Changayees',
    metaDescription:
      'Request a quote for bulk uniform orders with custom sizing and fabric options.',
  },
  {
    pageType: 'category',
    metaTitle: '{category} — Changayees',
    metaDescription:
      'Browse {category} for institutional bulk procurement.',
  },
  {
    pageType: 'industry',
    metaTitle: '{industry} Uniforms — Changayees',
    metaDescription:
      'Uniform procurement solutions tailored for the {industry} sector.',
  },
  {
    pageType: 'blog',
    metaTitle: '{title} — Changayees Blog',
    metaDescription: 'Procurement guides and uniform insights from Changayees.',
  },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function seedRoles() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  log(`roles: ${ROLES.length}`);
}

async function seedPermissions() {
  const rows = Object.entries(PERMISSION_CATALOG).flatMap(([module, actions]) =>
    actions.map((action) => ({
      name: `${module}.${action}`,
      module,
      description: `${action} ${module}`,
    })),
  );
  for (const row of rows) {
    await prisma.permission.upsert({
      where: { name: row.name },
      update: { module: row.module, description: row.description },
      create: row,
    });
  }
  log(`permissions: ${rows.length}`);
}

async function seedRolePermissions() {
  const allPermissions = await prisma.permission.findMany();
  const allRoles = await prisma.role.findMany();
  const permByName = new Map(allPermissions.map((p) => [p.name, p.id]));
  const roleByName = new Map(allRoles.map((r) => [r.name, r.id]));

  const pairs: { roleId: string; permissionId: string }[] = [];

  for (const roleName of ROLE_NAMES) {
    const roleId = roleByName.get(roleName);
    if (!roleId) continue;

    for (const name of expandRoleGrant(roleName)) {
      const permissionId = permByName.get(name);
      if (permissionId) pairs.push({ roleId, permissionId });
    }
  }

  await prisma.rolePermission.createMany({ data: pairs, skipDuplicates: true });
  log(`role_permissions: ${pairs.length}`);
}

async function seedSuperAdmin() {
  const role = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
  if (!role) throw new Error('Super Admin role missing — seed roles first.');

  const passwordHash = await bcrypt.hash(SUPER_ADMIN.password, 12);

  await prisma.user.upsert({
    where: { email: SUPER_ADMIN.email },
    update: { roleId: role.id, status: RecordStatus.ACTIVE },
    create: {
      name: SUPER_ADMIN.name,
      email: SUPER_ADMIN.email,
      passwordHash,
      roleId: role.id,
      status: RecordStatus.ACTIVE,
    },
  });
  log(`super admin: ${SUPER_ADMIN.email}`);
}

async function seedCategories() {
  let subCount = 0;
  for (const category of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: {
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
      },
    });
    for (const sub of category.subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, categoryId: created.id },
        create: { name: sub.name, slug: sub.slug, categoryId: created.id },
      });
      subCount += 1;
    }
  }
  log(`categories: ${CATEGORIES.length}, subcategories: ${subCount}`);
}

async function seedIndustries() {
  for (const industry of INDUSTRIES) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: { name: industry.name },
      create: industry,
    });
  }
  log(`industries: ${INDUSTRIES.length}`);
}

async function seedSettings() {
  for (const [settingKey, settingValue] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({
      where: { settingKey },
      update: {},
      create: { settingKey, settingValue },
    });
  }
  log(`settings: ${Object.keys(SETTINGS).length}`);
}

async function seedSeoDefaults() {
  // pageId is null for global defaults; a compound-unique `where` cannot take a
  // null component, so we find-then-write rather than upsert.
  for (const seo of SEO_DEFAULTS) {
    const existing = await prisma.seoSetting.findFirst({
      where: { pageType: seo.pageType, pageId: null },
      select: { id: true },
    });
    if (existing) {
      await prisma.seoSetting.update({
        where: { id: existing.id },
        data: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
        },
      });
    } else {
      await prisma.seoSetting.create({
        data: {
          pageType: seo.pageType,
          pageId: null,
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
        },
      });
    }
  }
  log(`seo defaults: ${SEO_DEFAULTS.length}`);
}

function log(message: string) {
  // eslint-disable-next-line no-console
  console.log(`  ✓ ${message}`);
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding Changayees reference data…');
  await seedRoles();
  await seedPermissions();
  await seedRolePermissions();
  await seedSuperAdmin();
  await seedCategories();
  await seedIndustries();
  await seedSettings();
  await seedSeoDefaults();
  // eslint-disable-next-line no-console
  console.log('Seed complete.');
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
