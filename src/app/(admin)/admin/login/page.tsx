'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.message ?? 'Sign in failed. Please try again.');
        setLoading(false);
        return;
      }

      // Cookies are set by the server; navigate into the portal.
      router.replace(redirect.startsWith('/admin') ? redirect : '/admin');
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo height={40} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2 sm:p-8">
          <div className="mb-6 space-y-1 text-center">
            <h1 className="text-h3">Admin sign in</h1>
            <p className="text-body-sm text-muted-foreground">
              Sign in to manage products, leads, orders, and content.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@changayees.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-body-sm text-destructive"
              >
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-caption text-muted-foreground">
          Authorised personnel only.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-muted/30" />}>
      <LoginForm />
    </Suspense>
  );
}
