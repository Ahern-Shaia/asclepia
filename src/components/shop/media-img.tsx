// Product photos come out of the image pipeline already re-encoded at two widths
// (catalog.md §4.2: /media/<key>-400.webp and -1600.webp); next/image would only encode them again.
export const mediaUrl = (key: string, size: 400 | 1600) => `/media/${key}-${size}.webp`;

export function MediaImg({
  storageKey,
  size,
  alt,
  className,
  eager = false,
}: {
  storageKey: string;
  size: 400 | 1600;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from /media
    <img
      src={mediaUrl(storageKey, size)}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
