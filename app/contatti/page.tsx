import type { Metadata } from "next";

import { Card } from "@/components/shared/Card";
import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { getSiteSettings, getWhatsAppLink, normalizeExternalUrl } from "@/lib/supabase/site-settings";

export const metadata: Metadata = {
  title: "Contatti | Dance With Me",
  description: "Contatta Dance With Me per informazioni su corsi e iscrizioni.",
};

export default async function ContattiPage() {
  const { data: settings } = await getSiteSettings();

  const phone = settings?.phone?.trim() || "";
  const email = settings?.email?.trim() || "";
  const address = settings?.address?.trim() || "";
  const whatsapp = settings?.whatsapp?.trim() || "";
  const mapsUrl = normalizeExternalUrl(settings?.google_maps_url);
  const facebookUrl = normalizeExternalUrl(settings?.facebook_url);
  const instagramUrl = normalizeExternalUrl(settings?.instagram_url);
  const youtubeUrl = normalizeExternalUrl(settings?.youtube_url);
  const whatsappLink = getWhatsAppLink(whatsapp);
  const hasContacts = Boolean(phone || email || address || whatsapp || mapsUrl || facebookUrl || instagramUrl || youtubeUrl);

  return (
    <>
      <PagePlaceholder
        title="Contatti"
        description="Scrivici o chiamaci per informazioni su corsi, iscrizioni e lezioni di prova."
      />
      <Container className="pb-14">
        <Card>
          <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
            {phone ? (
              <p>
                <strong>Telefono:</strong> {phone}
              </p>
            ) : null}
            {email ? (
              <p>
                <strong>Email:</strong> {email}
              </p>
            ) : null}
            {address ? (
              <p>
                <strong>Indirizzo:</strong>{" "}
                {mapsUrl ? (
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                    {address}
                  </a>
                ) : (
                  address
                )}
              </p>
            ) : null}
            {whatsapp ? (
              <p>
                <strong>WhatsApp:</strong>{" "}
                {whatsappLink ? (
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                    {whatsapp}
                  </a>
                ) : (
                  whatsapp
                )}
              </p>
            ) : null}
            {mapsUrl ? (
              <p>
                <strong>Google Maps:</strong>{" "}
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  Apri mappa
                </a>
              </p>
            ) : null}
            {facebookUrl ? (
              <p>
                <strong>Facebook:</strong>{" "}
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  Vai al profilo
                </a>
              </p>
            ) : null}
            {instagramUrl ? (
              <p>
                <strong>Instagram:</strong>{" "}
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  Vai al profilo
                </a>
              </p>
            ) : null}
            {youtubeUrl ? (
              <p>
                <strong>YouTube:</strong>{" "}
                <a href={youtubeUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  Vai al canale
                </a>
              </p>
            ) : null}
            {!hasContacts ? <p className="sm:col-span-2 text-gray-500">Contatti non ancora disponibili.</p> : null}
          </div>
        </Card>
      </Container>
    </>
  );
}
