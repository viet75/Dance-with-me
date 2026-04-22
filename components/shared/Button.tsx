import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Button({ href, children, variant = "primary", className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-center text-sm font-semibold sm:min-h-0 sm:py-2.5",
        variant === "primary"
          ? "bg-primary text-white hover:bg-violet-700"
          : "border border-primary text-primary hover:bg-primary-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}
