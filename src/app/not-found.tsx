import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
