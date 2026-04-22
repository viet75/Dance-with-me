import Link from "next/link";

import { Container } from "@/components/shared/Container";
import { getSiteSettings, normalizeExternalUrl } from "@/lib/supabase/site-settings";

export async function Footer() {
  const { data: settings } = await getSiteSettings();
  const schoolName = settings?.school_name?.trim() || "Dance With Me";
  const mapsUrl = normalizeExternalUrl(settings?.google_maps_url);
  const facebookUrl = normalizeExternalUrl(settings?.facebook_url);
  const instagramUrl = normalizeExternalUrl(settings?.instagram_url);
  const youtubeUrl = normalizeExternalUrl(settings?.youtube_url);
  const hasSocialLinks = Boolean(mapsUrl || facebookUrl || instagramUrl || youtubeUrl);

  return (
    <footer className="mt-16 w-full min-w-0 border-t border-gray-200 bg-white">
      <Container className="max-w-6xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-6">
          {hasSocialLinks ? (
            <div className="flex min-w-0 flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Seguici</p>
              <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2">
                {facebookUrl ? (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-700 transition hover:text-purple-600"
                  >
                    Facebook
                  </a>
                ) : null}
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-700 transition hover:text-purple-600"
                  >
                    Instagram
                  </a>
                ) : null}
                {youtubeUrl ? (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-700 transition hover:text-purple-600"
                  >
                    YouTube
                  </a>
                ) : null}
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-700 transition hover:text-purple-600"
                  >
                    Google Maps
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Link utili</p>
            <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2">
              <Link href="/contatti" className="text-sm text-gray-700 transition hover:text-purple-600">
                Contatti
              </Link>
              <Link href="/admin" className="text-sm text-gray-700 transition hover:text-purple-600">
                Area Admin
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200" />
          <p className="mt-6 min-w-0 break-words text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {schoolName}. Tutti i diritti riservati.
          </p>
        </div>
      </Container>
    </footer>
  );
}
