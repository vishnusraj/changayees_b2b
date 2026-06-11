/** Config that drives the generic CMS list + editor for a content module. */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'status'
  | 'media';

export interface ResourceField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Static options for `select`. */
  options?: { label: string; value: string }[];
  /** Fetch options from a CMS endpoint (returns [{id,name}] or {label,value}). */
  optionsEndpoint?: string;
  /** Status enum kind for the `status` field. */
  statusKind?: 'publish' | 'record';
}

export interface ResourceColumn {
  header: string;
  field: string;
  /** Render a status badge for this column. */
  badge?: boolean;
}

export interface ResourceConfig {
  /** Singular label, e.g. "Blog". */
  label: string;
  /** Plural label, e.g. "Blogs". */
  labelPlural: string;
  /** Admin base path, e.g. "/admin/cms/blogs". */
  basePath: string;
  /** API path, e.g. "/cms/blogs". */
  apiPath: string;
  /** Field used as the row title. */
  titleField: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
}

export const PUBLISH_STATUS_OPTIONS = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export const RECORD_STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];
