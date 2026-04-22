import type { NavItem } from "@/types/content";

export const publicNavItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/corsi", label: "Corsi" },
  { href: "/orari", label: "Orari" },
  { href: "/news", label: "News" },
  { href: "/video", label: "Video" },
  { href: "/galleria", label: "Galleria" },
  { href: "/contatti", label: "Contatti" },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/chi-siamo", label: "Chi siamo" },
  { href: "/admin/corsi", label: "Corsi" },
  { href: "/admin/orari", label: "Orari" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/video", label: "Video" },
  { href: "/admin/galleria", label: "Galleria" },
  { href: "/admin/impostazioni", label: "Impostazioni" },
];
