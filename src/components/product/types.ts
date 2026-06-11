/** View-model types for product components (decoupled from Prisma models). */

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  moq?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductSpecGroup {
  title: string;
  items: ProductSpec[];
}

/** Full product view-model for the detail page. */
export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  productCode: string;
  shortDescription: string | null;
  description: string | null;
  fabricType: string | null;
  moq: number | null;
  availableSizes: string[];
  availableColors: string[];
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  subcategoryName: string | null;
  images: ProductImage[];
  brochureUrl: string | null;
}

/** Paginated listing result. */
export interface ProductListResult {
  products: ProductCardData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Available filter facets for a listing context. */
export interface FilterFacets {
  subcategories: { name: string; slug: string }[];
  fabrics: string[];
  colors: string[];
}

/** Category for chips / navigation. */
export interface CategoryNav {
  id: string;
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
}
