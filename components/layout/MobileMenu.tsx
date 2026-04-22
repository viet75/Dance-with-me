"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { publicNavItems } from "@/lib/utils/navigation";
import { cn } from "@/lib/utils/cn";

type MobileSocialLinks = {
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
};

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="text-gray-500 transition hover:text-purple-600"
    >
      {children}
    </a>
  );
}

export function MobileMenu({ socialLinks }: { socialLinks: MobileSocialLinks }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = "mobile-navigation";
  const hasSocialLinks = Boolean(socialLinks.facebookUrl || socialLinks.instagramUrl || socialLinks.youtubeUrl);

  return (
    <div className="relative z-[60] shrink-0 pointer-events-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative z-[70] inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-2 rounded-xl border border-black/5 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-150 ease-out pointer-events-auto hover:bg-white hover:shadow-[0_6px_18px_rgba(15,23,42,0.12)] active:scale-[0.97] active:shadow-[0_2px_8px_rgba(15,23,42,0.10)]"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
      >
        {open ? "Chiudi" : "Menu"}
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute right-0 top-full z-[80] mt-2 w-[min(18rem,calc(100vw-2rem))] max-h-[min(70vh,24rem)] overflow-y-auto rounded-xl border border-border bg-white p-4 shadow-xl pointer-events-auto"
        >
          <nav className="flex flex-col gap-1">
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    isActive ? "bg-primary-soft text-primary" : "text-gray-700 hover:bg-primary-soft hover:text-primary",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {hasSocialLinks ? (
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center gap-4">
                {socialLinks.instagramUrl ? (
                  <SocialIconLink href={socialLinks.instagramUrl} label="Instagram">
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                      <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8zm8.8 1.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 7a5 5 0 1 1 0 10.1A5 5 0 0 1 12 7zm0 1.9a3.1 3.1 0 1 0 0 6.3 3.1 3.1 0 0 0 0-6.3z" />
                    </svg>
                  </SocialIconLink>
                ) : null}
                {socialLinks.facebookUrl ? (
                  <SocialIconLink href={socialLinks.facebookUrl} label="Facebook">
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                      <path d="M13.5 8.5V6.8c0-.8.5-1.3 1.4-1.3h1.6V2.6c-.3 0-1.3-.1-2.5-.1-2.6 0-4.4 1.6-4.4 4.5v1.5H7v3.3h2.6v8.2h3.9v-8.2h2.9l.5-3.3h-3.4z" />
                    </svg>
                  </SocialIconLink>
                ) : null}
                {socialLinks.youtubeUrl ? (
                  <SocialIconLink href={socialLinks.youtubeUrl} label="YouTube">
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                      <path d="M21.8 8.1a3 3 0 0 0-2.1-2.1C17.9 5.5 12 5.5 12 5.5s-5.9 0-7.7.5A3 3 0 0 0 2.2 8.1 31 31 0 0 0 1.8 12c0 1.3.1 2.6.4 3.9a3 3 0 0 0 2.1 2.1c1.8.5 7.7.5 7.7.5s5.9 0 7.7-.5a3 3 0 0 0 2.1-2.1c.3-1.3.4-2.6.4-3.9 0-1.3-.1-2.6-.4-3.9zM10.1 15V9l5.2 3-5.2 3z" />
                    </svg>
                  </SocialIconLink>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
