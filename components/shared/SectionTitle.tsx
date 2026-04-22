type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="mb-6 min-w-0 max-w-2xl sm:mb-8">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-balance text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-pretty text-sm leading-relaxed text-gray-600 sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
