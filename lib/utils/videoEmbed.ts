/**
 * URL embed per iframe da link YouTube o Vimeo (es. campo `youtube_url` nei corsi).
 */
export function getVideoEmbedUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?&]+)/,
    /(?:youtube\.com\/embed\/)([^?&]+)/,
    /(?:youtube\.com\/shorts\/)([^?&]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  const vimeoPlayer = trimmed.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeoPlayer?.[1]) {
    return `https://player.vimeo.com/video/${vimeoPlayer[1]}`;
  }

  const vimeoId = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoId?.[1]) {
    return `https://player.vimeo.com/video/${vimeoId[1]}`;
  }

  return null;
}
