import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { getPublishedBlog } from '@/features/cms/blog.service';
import { formatDate } from '@/lib/format';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, articleSchema } from '@/lib/seo';
import { safe } from '@/lib/safe-data';

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await safe(getPublishedBlog(slug), null, 'getPublishedBlog');
  if (!post) return { title: 'Post not found' };
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    path: `/blog/${post.slug}`,
    image: post.featuredImage,
    type: 'article',
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await safe(getPublishedBlog(slug), null, 'getPublishedBlog');
  if (!post) notFound();

  return (
    <Container className="py-6 md:py-10">
      <JsonLd
        data={articleSchema({
          type: 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: post.featuredImage,
          datePublished: post.publishedAt?.toISOString() ?? null,
          path: `/blog/${post.slug}`,
        })}
      />
      <article className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-h1">{post.title}</h1>
          <p className="text-caption text-muted-foreground">
            {formatDate(post.publishedAt)}
          </p>
        </header>

        {post.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-xl object-cover"
          />
        )}

        {post.content && (
          <div className="text-body whitespace-pre-wrap leading-relaxed text-foreground">
            {post.content}
          </div>
        )}
      </article>
    </Container>
  );
}
