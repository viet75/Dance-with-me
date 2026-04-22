import { Button } from "@/components/shared/Button";
import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { getSiteSettings, getWhatsAppLink, normalizeExternalUrl } from "@/lib/supabase/site-settings";

export async function ContactSection() {
  const { data: settings } = await getSiteSettings();

  const phone = settings?.phone?.trim() || "";
  const email = settings?.email?.trim() || "";
  const whatsapp = settings?.whatsapp?.trim() || "";
  const address = settings?.address?.trim() || "";
  const mapsUrl = normalizeExternalUrl(settings?.google_maps_url);
  const whatsappLink = getWhatsAppLink(whatsapp);
  const hasContacts = Boolean(phone || email || whatsapp || address || mapsUrl);

  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container className="rounded-3xl border border-border bg-white p-5 sm:p-8 md:p-10">
        <SectionTitle
          title="Contattaci"
          description="Ti aiutiamo a trovare il corso perfetto in base al tuo livello e ai tuoi obiettivi."
        />
        <div className="grid gap-6 text-sm text-gray-700 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            {hasContacts ? (
              <>
                {phone ? (
                  <p className="break-words">
                    <strong>Telefono:</strong> {phone}
                  </p>
                ) : null}
                {email ? (
                  <p>
                    <strong>Email:</strong> <span className="break-all">{email}</span>
                  </p>
                ) : null}
                {address ? (
                  <p className="break-words">
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
                  <p className="break-words">
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
                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                      Apri su Google Maps
                    </a>
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-gray-500">Contatti non ancora disponibili.</p>
            )}
          </div>
          <div className="flex min-w-0 items-start sm:items-end">
            <Button href="/contatti">Vai alla pagina contatti</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
