export type AboutContent = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  quote: string | null;
  updated_at: string;
};

export type Video = {
  id: string;
  title: string;
  youtube_url: string;
  display_order: number;
  is_active: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  image_url: string;
  category?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug?: string | null;
  level?: string | null;
  display_order: number;
  is_active: boolean;
  description?: string | null;
  youtube_url?: string | null;
  created_at?: string;
  updated_at?: string;
  name?: string | null;
};

export type Schedule = {
  id: string;
  course_id?: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher?: string | null;
  room?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type News = {
  id: string;
  title: string;
  slug?: string | null;
  content: string;
  cover_image?: string | null;
  youtube_url?: string | null;
  is_published: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SiteSettings = {
  id: string;
  school_name?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  maps_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  key?: string;
  value?: string;
  created_at?: string;
  updated_at?: string;
};
