import { AppShell } from "@/components/AppShell";
import { TransactionsList } from "@/components/transactions/TransactionsList";

export default function TransactionsPage() {
  return (
    <AppShell active="Transactions">
      <section className="page-heading">
        <p className="eyebrow">Transactions</p>
        <h1>Income, expenses, and transfers</h1>
        <p>
          Transfers are modeled separately from income and expenses, with room
          for splits, rules, imports, receipts, tags, and audit trails.
        </p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">August 2026</p>
            <h2>Recent transactions</h2>
          </div>
          <div className="button-row">
            <button className="ghost-button">Import</button>
            <a className="primary-button link-button" href="/quick-entry">
              Add transaction
            </a>
          </div>
        </div>
        <div className="transaction-list">
          <TransactionsList />
        </div>
      </section>
    </AppShell>
  );
}
