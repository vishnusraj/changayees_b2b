// Test-env defaults — set before any module that reads them at import time
// (e.g. auth config's requireEnv for JWT secrets).
process.env.JWT_ACCESS_SECRET ||= 'test-access-secret';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret';
process.env.NEXT_PUBLIC_APP_URL ||= 'http://localhost:3000';
process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||= '919876543210';

import { expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Accessibility assertions (toHaveNoViolations) for jsdom tests.
expect.extend(axeMatchers);
