const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const VERSION = /^v\d+$/;
const TRANSFORM_PARAM = /^[a-z]{1,3}_/;
// Segments that only request automatic format/quality are superseded by our own transformation.
const REDUNDANT_PARAM = /^(f_auto|q_auto(:\w+)?)$/;

const isTransformation = (segment) => segment.split(",").every((param) => TRANSFORM_PARAM.test(param));

/**
 * Returns a Cloudinary delivery URL that serves an automatically formatted
 * (AVIF/WebP), quality-optimised image no wider than `width` pixels.
 * Any non-Cloudinary URL is returned unchanged.
 */
export function optimizeImage(url, width) {
  if (typeof url !== "string") return url;
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match) return url;

  const [, base, rest] = match;
  const segments = rest.split("/");
  const transformations = [];
  let index = 0;
  while (index < segments.length - 1 && !VERSION.test(segments[index]) && isTransformation(segments[index])) {
    const params = segments[index].split(",").filter((param) => !REDUNDANT_PARAM.test(param));
    if (params.length) transformations.push(params.join(","));
    index += 1;
  }

  const own = ["f_auto", "q_auto", width ? `w_${Math.round(width)}` : null, width ? "c_limit" : null].filter(Boolean).join(",");
  return `${base}${[...transformations, own, ...segments.slice(index)].join("/")}`;
}

/** Builds a `srcset` string for the given widths, or `undefined` for non-Cloudinary URLs. */
export function imageSrcSet(url, widths) {
  if (typeof url !== "string" || !CLOUDINARY_UPLOAD.test(url)) return undefined;
  return widths.map((width) => `${optimizeImage(url, width)} ${width}w`).join(", ");
}
