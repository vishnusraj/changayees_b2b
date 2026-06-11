// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AppShell } from '@/components/layout/app-shell';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { Button } from '@/components/ui/button';

/**
 * Responsive "class-contract" tests — assert the responsive Tailwind utilities
 * that drive the mobile-first → desktop behaviour are present. (True viewport
 * rendering is covered by the Playwright E2E suite.)
 */
describe('responsive class contracts', () => {
  it('AppShell reserves space for the mobile bottom nav (md:pb-0)', () => {
    const { container } = render(
      <AppShell hasBottomNav>
        <div>content</div>
      </AppShell>,
    );
    const main = container.querySelector('main');
    expect(main?.className).toContain('pb-20');
    expect(main?.className).toContain('md:pb-0');
  });

  it('Container caps width via the page-container utility', () => {
    const { container } = render(<Container>x</Container>);
    expect(container.firstElementChild?.className).toContain('container-page');
  });

  it('Grid uses the 4/8/12 responsive layout grid', () => {
    const { container } = render(<Grid>x</Grid>);
    expect(container.firstElementChild?.className).toContain('layout-grid');
  });

  it('icon Button is a square touch target', () => {
    const { getByRole } = render(
      <Button size="icon" aria-label="settings">
        i
      </Button>,
    );
    expect(getByRole('button').className).toMatch(/h-10/);
    expect(getByRole('button').className).toMatch(/w-10/);
  });
});
