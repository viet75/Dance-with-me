/**
 * Estrae l'id video da URL YouTube comuni (watch, embed, shorts, youtu.be, mobile).
 */
export function getYouTubeVideoId(input: string): string | null {
  const value = input.trim();
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./i, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname === "/watch" || url.pathname.startsWith("/watch")) {
        const v = url.searchParams.get("v");
        if (v) {
          return v;
        }
      }

      const segments = url.pathname.split("/").filter(Boolean);
      if (segments[0] === "embed" && segments[1]) {
        return segments[1];
      }
      if (segments[0] === "shorts" && segments[1]) {
        return segments[1];
      }
      if (segments[0] === "live" && segments[1]) {
        return segments[1];
      }
    }
  } catch {
    /* non è un URL valido */
  }

  const watchMatch = /[?&]v=([a-zA-Z0-9_-]{6,})/.exec(value);
  if (watchMatch) {
    return watchMatch[1];
  }

  const shortLink = /youtu\.be\/([a-zA-Z0-9_-]{6,})/.exec(value);
  if (shortLink) {
    return shortLink[1];
  }

  const embedMatch = /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/.exec(value);
  if (embedMatch) {
    return embedMatch[1];
  }

  const shortsMatch = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/.exec(value);
  if (shortsMatch) {
    return shortsMatch[1];
  }

  return null;
}

/** @deprecated Usare {@link getYouTubeVideoId} */
export function getYouTubeId(url: string): string | null {
  return getYouTubeVideoId(url);
}

export function toYoutubeEmbedUrl(value: string): string | null {
  const id = getYouTubeVideoId(value);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
