import { AppShell } from "@/components/AppShell";
import { SpendingDashboard } from "@/components/dashboard/SpendingDashboard";

export default function DashboardPage() {
  return (
    <AppShell active="Dashboard">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Spending command center</p>
          <h1>Dashboard</h1>
          <p className="hero-copy">
            Monthly expense, category spending, daily average, and cashflow
            trend stay upfront. Balances and card dues live in their own sections.
          </p>
        </div>
        <div className="quick-links-panel">
          <a href="/quick-entry">Add entry</a>
          <a href="/balances">Balances</a>
          <a href="/card-dues">Card dues</a>
          <a href="/budgets">Budgets</a>
        </div>
      </section>

      <SpendingDashboard />
    </AppShell>
  );
}
