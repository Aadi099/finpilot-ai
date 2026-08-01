import { AppShell } from "@/components/AppShell";
import { CardDuesWorkspace } from "@/components/card-dues/CardDuesWorkspace";

export default function CardDuesPage() {
  return (
    <AppShell active="Card Dues">
      <section className="page-heading">
        <p className="eyebrow">Card dues</p>
        <h1>Credit card bills and due dates</h1>
        <p>
          See outstanding dues, statement dates, due dates, days left, and mark
          card payments when you pay from a bank account.
        </p>
      </section>
      <CardDuesWorkspace />
    </AppShell>
  );
}
