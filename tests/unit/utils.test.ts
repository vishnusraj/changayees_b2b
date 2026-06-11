import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slug';
import { whatsappHref } from '@/lib/whatsapp';
import { formatNumber } from '@/lib/format';

describe('cn (class merge)', () => {
  it('merges classes', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('School Uniforms')).toBe('school-uniforms');
  });
  it('strips special characters', () => {
    expect(slugify('Lab Coats & Aprons!')).toBe('lab-coats-aprons');
  });
  it('trims leading/trailing hyphens', () => {
    expect(slugify('  --Hello--  ')).toBe('hello');
  });
  it('falls back for empty input', () => {
    expect(slugify('!!!')).toMatch(/^item-/);
  });
});

describe('whatsappHref', () => {
  it('builds a wa.me link from the configured number', () => {
    expect(whatsappHref()).toBe('https://wa.me/919876543210');
  });
  it('encodes a prefilled message', () => {
    expect(whatsappHref('Hi there')).toBe(
      'https://wa.me/919876543210?text=Hi%20there',
    );
  });
});

describe('formatNumber', () => {
  it('formats with Indian grouping', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });
});
