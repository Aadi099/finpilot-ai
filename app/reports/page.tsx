import { AppShell } from "@/components/AppShell";
import { ReportsWorkspace } from "@/components/reports/ReportsWorkspace";

export default function ReportsPage() {
  return (
    <AppShell active="Reports">
      <section className="page-heading">
        <p className="eyebrow">Reports</p>
        <h1>Monthly report</h1>
        <p>
          Review income, expenses, savings, biggest spends, and export the month
          as PDF or CSV.
        </p>
      </section>
      <ReportsWorkspace />
    </AppShell>
  );
}
