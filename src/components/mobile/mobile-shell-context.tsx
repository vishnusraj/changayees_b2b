'use client';

import * as React from 'react';

/**
 * MobileShell coordination context.
 *
 * Enforces the bottom-bar layering rule (architecture §2.3 / U-02): at most one
 * persistent bottom element per screen, with priority
 *   StickyCTA  >  FloatingWhatsApp  >  BottomNavigation.
 *
 * A page renders a <StickyCTA>, which registers here; the BottomNavigation and
 * FloatingWhatsApp read `stickyActive` and step aside so the bars never stack.
 *
 * A safe default is provided so components (e.g. in the tracking layout, which
 * has no provider) never throw.
 */
interface MobileShellValue {
  /** True when a page-level sticky CTA is mounted. */
  stickyActive: boolean;
  /** Register a sticky CTA; returns an unregister cleanup. */
  registerSticky: () => () => void;
}

const MobileShellContext = React.createContext<MobileShellValue>({
  stickyActive: false,
  registerSticky: () => () => {},
});

export function useMobileShell(): MobileShellValue {
  return React.useContext(MobileShellContext);
}

export function MobileShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reference-count active sticky CTAs (robust to transitions / nesting).
  const [count, setCount] = React.useState(0);

  const registerSticky = React.useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => Math.max(0, c - 1));
  }, []);

  const value = React.useMemo<MobileShellValue>(
    () => ({ stickyActive: count > 0, registerSticky }),
    [count, registerSticky],
  );

  return (
    <MobileShellContext.Provider value={value}>
      {children}
    </MobileShellContext.Provider>
  );
}
