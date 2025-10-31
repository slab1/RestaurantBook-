// Custom image loader for Next.js
export default function imageLoader({ src, width, quality }) {
  // For local images, return as-is
  if (src.startsWith('/')) {
    return src;
  }
  
  // For external images, return with width and quality params
  const params = [`w=${width}`];
  if (quality) {
    params.push(`q=${quality}`);
  }
  
  const paramsString = params.join('&');
  return `${src}?${paramsString}`;
}
