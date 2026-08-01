import { AppShell } from "@/components/AppShell";
import { QuickEntryForm } from "@/components/quick-entry/QuickEntryForm";

export default function QuickEntryPage() {
  return (
    <AppShell active="Quick Entry">
      <section className="page-heading">
        <p className="eyebrow">Daily flow</p>
        <h1>Quick entry</h1>
        <p>
          Add expenses, incoming money, and credit-card spends from your phone
          with the least typing possible.
        </p>
      </section>
      <QuickEntryForm />
    </AppShell>
  );
}
