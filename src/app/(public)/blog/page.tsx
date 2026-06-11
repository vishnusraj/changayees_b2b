import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/feedback/empty-state';
import { listPublishedBlogs } from '@/features/cms/blog.service';
import { formatDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import { safe } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: 'Procurement guides, uniform insights, and industry knowledge.',
  path: '/blog',
});

export default async function BlogPage() {
  const posts = await safe(listPublishedBlogs(), [], 'listPublishedBlogs');

  return (
    <Container className="py-6 md:py-10">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-h1">Blog</h1>
        <p className="text-body-lg text-muted-foreground">
          Procurement guides, uniform knowledge, and industry insights.
        </p>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Check back soon for procurement guides and insights."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevation-1 transition-shadow hover:shadow-elevation-2"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-blue/20 to-brand-teal/20">
                {post.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h2 className="text-h4 line-clamp-2">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-body-sm line-clamp-3 text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
                <span className="text-caption mt-auto pt-2 text-muted-foreground">
                  {formatDate(post.publishedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
