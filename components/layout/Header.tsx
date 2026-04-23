"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/shared/Container";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { getSiteSettings, normalizeExternalUrl } from "@/lib/supabase/site-settings";
import { publicNavItems } from "@/lib/utils/navigation";
import { cn } from "@/lib/utils/cn";

type HeaderSocialLinks = {
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

export function Header() {
  const pathname = usePathname();
  const [socialLinks, setSocialLinks] = useState<HeaderSocialLinks>({
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await getSiteSettings();
      setSocialLinks({
        facebookUrl: normalizeExternalUrl(data?.facebook_url),
        instagramUrl: normalizeExternalUrl(data?.instagram_url),
        youtubeUrl: normalizeExternalUrl(data?.youtube_url),
      });
    };

    void loadSettings();
  }, []);

  const hasSocialLinks = Boolean(socialLinks.facebookUrl || socialLinks.instagramUrl || socialLinks.youtubeUrl);

  return (
    <header className="sticky top-0 z-50">
      <div style={{ height: "env(safe-area-inset-top)" }} />
      <div className="border-b border-white/30 bg-white/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <Container className="relative flex min-h-16 min-w-0 items-center gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 overflow-hidden text-base font-semibold tracking-tight text-gray-900 sm:text-lg"
          >
            <Image
              src="/icon-192.png"
              alt="Dance With Me logo"
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <span className="truncate text-lg font-semibold tracking-tight">
              Dance With Me
            </span>
          </Link>
        </div>
        <nav className="hidden items-center gap-4 md:flex lg:gap-5">
          {publicNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          {hasSocialLinks ? (
            <div className="ml-2 flex items-center gap-3 lg:ml-3 lg:gap-4">
              {socialLinks.instagramUrl ? (
                <SocialIconLink href={socialLinks.instagramUrl} label="Instagram">
                  <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true">
                    <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8zm8.8 1.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 7a5 5 0 1 1 0 10.1A5 5 0 0 1 12 7zm0 1.9a3.1 3.1 0 1 0 0 6.3 3.1 3.1 0 0 0 0-6.3z" />
                  </svg>
                </SocialIconLink>
              ) : null}
              {socialLinks.facebookUrl ? (
                <SocialIconLink href={socialLinks.facebookUrl} label="Facebook">
                  <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 8.5V6.8c0-.8.5-1.3 1.4-1.3h1.6V2.6c-.3 0-1.3-.1-2.5-.1-2.6 0-4.4 1.6-4.4 4.5v1.5H7v3.3h2.6v8.2h3.9v-8.2h2.9l.5-3.3h-3.4z" />
                  </svg>
                </SocialIconLink>
              ) : null}
              {socialLinks.youtubeUrl ? (
                <SocialIconLink href={socialLinks.youtubeUrl} label="YouTube">
                  <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden="true">
                    <path d="M21.8 8.1a3 3 0 0 0-2.1-2.1C17.9 5.5 12 5.5 12 5.5s-5.9 0-7.7.5A3 3 0 0 0 2.2 8.1 31 31 0 0 0 1.8 12c0 1.3.1 2.6.4 3.9a3 3 0 0 0 2.1 2.1c1.8.5 7.7.5 7.7.5s5.9 0 7.7-.5a3 3 0 0 0 2.1-2.1c.3-1.3.4-2.6.4-3.9 0-1.3-.1-2.6-.4-3.9zM10.1 15V9l5.2 3-5.2 3z" />
                  </svg>
                </SocialIconLink>
              ) : null}
            </div>
          ) : null}
        </nav>
        <div className="ml-auto shrink-0 md:hidden">
          <MobileMenu socialLinks={socialLinks} />
        </div>
        </Container>
      </div>
    </header>
  );
}
