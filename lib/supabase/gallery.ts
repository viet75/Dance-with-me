import { supabase } from "@/lib/supabase/client";
import type { GalleryImage as DbGalleryImage } from "@/types/supabase";

export type GalleryImageView = {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
};

export async function getActiveGalleryImages(): Promise<{
  data: GalleryImageView[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id, title, image_url, category, display_order, is_active, is_featured, created_at, updated_at")
    .order("display_order", { ascending: true });

  if (error) {
    return { data: [], error: "Impossibile caricare la galleria al momento." };
  }

  const images = (data ?? []).map((image: DbGalleryImage) => ({
    id: image.id,
    image_url: image.image_url,
    title: image.title ?? null,
    category: image.category ?? null,
  }));

  return { data: images, error: null };
}

export async function getFeaturedGalleryImages(limit = 6): Promise<{
  data: GalleryImageView[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id, title, image_url, category, display_order, is_active, is_featured, created_at, updated_at")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    return { data: [], error: "Impossibile caricare la galleria in evidenza al momento." };
  }

  const images = (data ?? []).map((image: DbGalleryImage) => ({
    id: image.id,
    image_url: image.image_url,
    title: image.title ?? null,
    category: image.category ?? null,
  }));

  return { data: images, error: null };
}
