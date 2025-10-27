export default function myImageLoader({ src, width, quality }) {
  // For static export, we just return the src as-is
  // since we're not using dynamic image optimization
  return src
}