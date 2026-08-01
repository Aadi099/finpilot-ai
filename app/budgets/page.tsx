import { AppShell } from "@/components/AppShell";
import { BudgetWorkspace } from "@/components/budgets/BudgetWorkspace";

export default function BudgetsPage() {
  return (
    <AppShell active="Budgets">
      <section className="page-heading">
        <p className="eyebrow">Budgets</p>
        <h1>Category limits for the month</h1>
        <p>
          Set limits manually every month, copy the previous month when useful,
          and highlight overspending before it becomes invisible.
        </p>
      </section>
      <BudgetWorkspace />
    </AppShell>
  );
}
