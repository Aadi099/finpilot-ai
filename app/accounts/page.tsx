import { AppShell } from "@/components/AppShell";
import { AddBankAccountForm } from "@/components/accounts/AddBankAccountForm";
import { MetricCard } from "@/components/MetricCard";
import { accounts, investments } from "@/lib/sample-data";
import { formatCurrency, formatDate, sumBy } from "@/lib/format";

export default function AccountsPage() {
  const assets = accounts.filter((account) => account.balance > 0);
  const liabilities = accounts.filter((account) => account.balance < 0);
  const bankAccounts = accounts.filter((account) => account.kind === "bank");
  const investmentValue = sumBy(investments, "currentValue");

  return (
    <AppShell active="Accounts">
      <section className="page-heading">
        <p className="eyebrow">Accounts</p>
        <h1>Balances by account</h1>
        <p>
          Track cash, banks, credit cards, loans, brokerage accounts, provident
          funds, and custom assets in one ledger-ready model.
        </p>
      </section>

      <section className="metric-grid compact">
        <MetricCard label="Assets" value={formatCurrency(sumBy(assets, "balance"))} />
        <MetricCard label="Bank balance" value={formatCurrency(sumBy(bankAccounts, "balance"))} />
        <MetricCard label="Investments" value={formatCurrency(investmentValue)} />
        <MetricCard label="Liabilities" value={formatCurrency(Math.abs(sumBy(liabilities, "balance")))} tone="warn" />
      </section>

      <section className="balance-board">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Current balances</p>
              <h2>Bank accounts</h2>
            </div>
            <a className="primary-button link-button" href="#add-bank-account">Add bank</a>
          </div>
          <div className="stack">
            {bankAccounts.map((account) => (
              <div className="list-row balance-row" key={account.id}>
                <div>
                  <strong>{account.name}</strong>
                  <span>{account.institution} · Updated {formatDate(account.updatedAt)}</span>
                </div>
                <b>{formatCurrency(account.balance)}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Current value</p>
              <h2>Investments</h2>
            </div>
            <span className="pill">{formatCurrency(investmentValue)}</span>
          </div>
          <div className="stack">
            {investments.map((investment) => (
              <div className="list-row balance-row" key={investment.name}>
                <div>
                  <strong>{investment.name}</strong>
                  <span>{investment.provider} · Invested {formatCurrency(investment.investedAmount)}</span>
                </div>
                <b>{formatCurrency(investment.currentValue)}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Ledger</p>
            <h2>Connected account plan</h2>
          </div>
          <a className="primary-button link-button" href="#add-bank-account">Add account</a>
        </div>
        <div className="account-grid">
          {accounts.map((account) => (
            <article className="account-card" key={account.id}>
              <div>
                <span className="account-type">{account.type}</span>
                <h3>{account.name}</h3>
              </div>
              <strong className={account.balance < 0 ? "negative" : ""}>
                {formatCurrency(account.balance)}
              </strong>
              <footer>
                <span>{account.institution}</span>
                <span>Updated {formatDate(account.updatedAt)}</span>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <AddBankAccountForm />
    </AppShell>
  );
}
