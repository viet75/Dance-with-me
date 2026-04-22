import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";

type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="py-14">
      <Container>
        <SectionTitle title={title} description={description} />
      </Container>
    </section>
  );
}
