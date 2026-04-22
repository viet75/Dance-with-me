import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <article className={cn("min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5", className)}>
      {children}
    </article>
  );
}
