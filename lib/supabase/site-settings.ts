import { supabase } from "@/lib/supabase/client";

export type SiteSettingsView = {
  id: string;
  school_name: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  maps_url: string | null;
  google_maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
};

export async function getSiteSettings(): Promise<{
  data: SiteSettingsView | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "id, school_name, hero_title, hero_subtitle, phone, email, whatsapp, address, maps_url, facebook_url, instagram_url, youtube_url",
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: "Impossibile caricare le impostazioni del sito." };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const row = data as Record<string, unknown>;

  return {
    data: {
      id: String(row.id),
      school_name: (row.school_name as string | null | undefined) ?? null,
      hero_title: (row.hero_title as string | null | undefined) ?? null,
      hero_subtitle: (row.hero_subtitle as string | null | undefined) ?? null,
      phone: (row.phone as string | null | undefined) ?? null,
      email: (row.email as string | null | undefined) ?? null,
      whatsapp: (row.whatsapp as string | null | undefined) ?? null,
      address: (row.address as string | null | undefined) ?? null,
      maps_url: (row.maps_url as string | null | undefined) ?? null,
      google_maps_url: (row.maps_url as string | null | undefined) ?? null,
      facebook_url: (row.facebook_url as string | null | undefined) ?? null,
      instagram_url: (row.instagram_url as string | null | undefined) ?? null,
      youtube_url: (row.youtube_url as string | null | undefined) ?? null,
    },
    error: null,
  };
}

export function normalizeExternalUrl(value?: string | null): string {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function getWhatsAppLink(value?: string | null): string {
  const digits = (value ?? "").replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (!digits) return "";
  return `https://wa.me/${digits}`;
}
