/**
 * Builds a platform-specific iframe embed URL from a stored platform + videoId.
 * Returns an empty string for unknown platforms.
 */
export function buildEmbedUrl(platform: string, videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`;
    case 'aparat':
      return `https://www.aparat.com/video/video/embed/videohash/${videoId}/t/1`;
    default:
      return '';
  }
}
