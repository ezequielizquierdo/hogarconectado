const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";

interface ProductImageOptions {
  width?: number;
}

export function getProductImageUrl(
  sourceUrl: string,
  { width = 600 }: ProductImageOptions = {}
): string {
  if (!sourceUrl.includes("res.cloudinary.com") || !sourceUrl.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return sourceUrl;
  }

  const safeWidth = Math.max(120, Math.min(Math.round(width), 1600));
  const transformation = `f_auto,q_auto,w_${safeWidth},c_limit`;

  return sourceUrl.replace(
    CLOUDINARY_UPLOAD_SEGMENT,
    `${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/`
  );
}
