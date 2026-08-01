import { AppShell } from "@/components/AppShell";
import { transactions } from "@/lib/sample-data";
import { formatCurrency, formatDate } from "@/lib/format";

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
            <button className="primary-button">Add transaction</button>
          </div>
        </div>
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <article className="transaction-card" key={transaction.id}>
              <div>
                <strong>{transaction.merchant}</strong>
                <span>{transaction.category} · {transaction.account}</span>
              </div>
              <div>
                <strong className={transaction.amount > 0 ? "positive" : transaction.type === "transfer" ? "neutral" : ""}>
                  {formatCurrency(transaction.amount)}
                </strong>
                <span>{formatDate(transaction.date)} · paid {formatDate(transaction.paidDate)}</span>
              </div>
              <span className="payment-chip">{transaction.paymentMethod}</span>
              <span className={`status ${transaction.type}`}>{transaction.type}</span>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
