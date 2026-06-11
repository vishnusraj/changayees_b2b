/**
 * JsonLd — renders a JSON-LD structured-data script tag.
 * Server component; data is already a trusted, serializable object.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
