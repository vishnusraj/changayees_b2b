// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/feedback/alert';
import { EmptyState } from '@/components/feedback/empty-state';
import { StatusBadge } from '@/components/dashboard/status-badge';

// Component fragments aren't full pages — disable landmark/heading-context
// best-practice rules so we test the component's own a11y, not page structure.
const a11y = (c: HTMLElement) =>
  axe(c, {
    rules: {
      region: { enabled: false },
      'landmark-one-main': { enabled: false },
      'page-has-heading-one': { enabled: false },
      // jsdom has no layout/canvas, so contrast can't be measured here.
      'color-contrast': { enabled: false },
    },
  });

describe('accessibility (axe)', () => {
  it('Button — accessible name, no violations', async () => {
    const { container, getByRole } = render(<Button>Request Quote</Button>);
    expect(getByRole('button', { name: 'Request Quote' })).toBeInTheDocument();
    expect(await a11y(container)).toHaveNoViolations();
  });

  it('Badge — no violations', async () => {
    const { container } = render(<Badge variant="success">Won</Badge>);
    expect(await a11y(container)).toHaveNoViolations();
  });

  it('StatusBadge — no violations', async () => {
    const { container } = render(<StatusBadge status="QUOTATION_SENT" />);
    expect(await a11y(container)).toHaveNoViolations();
  });

  it('Alert — exposes role=alert, no violations', async () => {
    const { container, getByRole } = render(
      <Alert variant="danger" title="Error">
        Something failed
      </Alert>,
    );
    expect(getByRole('alert')).toBeInTheDocument();
    expect(await a11y(container)).toHaveNoViolations();
  });

  it('EmptyState — heading present, no violations', async () => {
    const { container, getByRole } = render(
      <EmptyState title="No products" description="Try later" />,
    );
    expect(getByRole('heading', { name: 'No products' })).toBeInTheDocument();
    expect(await a11y(container)).toHaveNoViolations();
  });
});
