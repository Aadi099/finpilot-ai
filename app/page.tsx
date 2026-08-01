import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { ProgressBar } from "@/components/ProgressBar";
import {
  accounts,
  assetAllocation,
  bills,
  budgetSnapshot,
  goals,
  investments,
  monthlySnapshots,
  netWorthTrend,
  transactions,
} from "@/lib/sample-data";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  sumBy,
} from "@/lib/format";

export default function DashboardPage() {
  const totalAssets = sumBy(accounts.filter((account) => account.kind !== "loan"), "balance");
  const liabilities = Math.abs(
    sumBy(accounts.filter((account) => account.kind === "loan"), "balance"),
  );
  const netWorth = totalAssets - liabilities;
  const monthlyIncome = sumBy(
    transactions.filter((transaction) => transaction.type === "income"),
    "amount",
  );
  const monthlyExpenses = Math.abs(
    sumBy(transactions.filter((transaction) => transaction.type === "expense"), "amount"),
  );
  const investmentValue = sumBy(investments, "currentValue");
  const investedAmount = sumBy(investments, "investedAmount");
  const unrealizedGain = investmentValue - investedAmount;
  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
  const upcomingBills = bills.filter((bill) => bill.status === "upcoming");
  const monthSetup = monthlySnapshots[0];
  const bankAccounts = accounts.filter((account) => account.kind === "bank");
  const bankBalance = sumBy(bankAccounts, "balance");

  return (
    <AppShell active="Dashboard">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Phase 1 foundation</p>
          <h1>FinPilot AI</h1>
          <p className="hero-copy">
            A production-ready personal finance and investment operating system,
            starting with real screens, typed data, auth scaffolding, and a Postgres
            model ready for the next phase.
          </p>
        </div>
        <div className="net-worth">
          <span>Total net worth</span>
          <strong>{formatCurrency(netWorth)}</strong>
          <small>Ready for your first entries</small>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard label="Monthly income" value={formatCurrency(monthlyIncome)} trend="+6.2%" />
        <MetricCard label="Bank balance" value={formatCurrency(bankBalance)} trend={`${bankAccounts.length} banks`} />
        <MetricCard label="Expenses" value={formatCurrency(monthlyExpenses)} trend="No spends yet" tone="warn" />
        <MetricCard label="Investments" value={formatCurrency(investmentValue)} trend={formatCurrency(unrealizedGain)} />
      </section>

      <section className="dashboard-grid">
        <div className="panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Current balances</p>
              <h2>Banks and investments</h2>
            </div>
            <a className="primary-button link-button" href="/accounts#add-bank-account">Add bank</a>
          </div>
          <div className="balance-split">
            <div>
              <span>Total bank balance</span>
              <strong>{formatCurrency(bankBalance)}</strong>
              {bankAccounts.length > 0 ? (
                bankAccounts.map((account) => (
                  <small key={account.id}>{account.name}: {formatCurrency(account.balance)}</small>
                ))
              ) : (
                <small>Add your first bank account to begin.</small>
              )}
            </div>
            <div>
              <span>Total investment value</span>
              <strong>{formatCurrency(investmentValue)}</strong>
              {investments.length > 0 ? (
                investments.slice(0, 3).map((investment) => (
                  <small key={investment.name}>{investment.name}: {formatCurrency(investment.currentValue)}</small>
                ))
              ) : (
                <small>Add your opening investment value this month.</small>
              )}
            </div>
          </div>
        </div>

        <div className="panel quick-action-panel">
          <div>
            <p className="eyebrow">Month health</p>
            <h2>Savings rate</h2>
            <p>{formatPercent(savingsRate)} after tracked expenses this month.</p>
          </div>
        </div>

        <div className="panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Month setup</p>
              <h2>Opening snapshot</h2>
            </div>
            <span className="pill">{monthSetup.month}</span>
          </div>
          <div className="snapshot-grid">
            <div>
              <span>Expected salary</span>
              <strong>{formatCurrency(monthSetup.salaryExpected)}</strong>
            </div>
            <div>
              <span>Opening investments</span>
              <strong>{formatCurrency(monthSetup.investmentValueOpening)}</strong>
            </div>
            <div>
              <span>Opening cash</span>
              <strong>{formatCurrency(monthSetup.cashOpening)}</strong>
            </div>
            <div>
              <span>Card due opening</span>
              <strong>{formatCurrency(monthSetup.creditCardDueOpening)}</strong>
            </div>
          </div>
        </div>

        <div className="panel quick-action-panel">
          <div>
            <p className="eyebrow">Fast habit</p>
            <h2>Add today’s spend</h2>
            <p>Designed for phone entry: amount, name, category, date, paid date, and payment mode.</p>
          </div>
          <a className="primary-button big link-button" href="/quick-entry">Quick entry</a>
        </div>

        <div className="panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Portfolio</p>
              <h2>Asset Allocation</h2>
            </div>
            <span className="pill">{formatCurrency(investmentValue)}</span>
          </div>
          <div className="allocation-list">
            {assetAllocation.length > 0 ? (
              assetAllocation.map((asset) => (
                <div className="allocation-row" key={asset.name}>
                  <div>
                    <span className="dot" style={{ background: asset.color }} />
                    <strong>{asset.name}</strong>
                  </div>
                  <ProgressBar value={asset.weight} color={asset.color} />
                  <span>{asset.weight}%</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No investment allocation yet.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Goals</p>
              <h2>Priority Targets</h2>
            </div>
          </div>
          <div className="stack">
            {goals.length > 0 ? (
              goals.slice(0, 3).map((goal) => (
                <div className="goal-row" key={goal.name}>
                  <div>
                    <strong>{goal.name}</strong>
                    <span>{formatCurrency(goal.current)} of {formatCurrency(goal.target)}</span>
                  </div>
                  <ProgressBar value={Math.round((goal.current / goal.target) * 100)} />
                </div>
              ))
            ) : (
              <p className="empty-state">No goals yet.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Bills</p>
              <h2>Upcoming</h2>
            </div>
            <span className="pill">{upcomingBills.length} due</span>
          </div>
          <div className="stack">
            {upcomingBills.length > 0 ? (
              upcomingBills.map((bill) => (
                <div className="list-row" key={bill.name}>
                  <div>
                    <strong>{bill.name}</strong>
                    <span>{formatDate(bill.dueDate)}</span>
                  </div>
                  <b>{formatCurrency(bill.amount)}</b>
                </div>
              ))
            ) : (
              <p className="empty-state">No upcoming bills yet.</p>
            )}
          </div>
        </div>

        <div className="panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Transactions</p>
              <h2>Recent Activity</h2>
            </div>
          </div>
          <div className="table">
            {transactions.length > 0 ? (
              transactions.slice(0, 6).map((transaction) => (
                <div className="table-row" key={transaction.id}>
                  <span>{transaction.merchant}</span>
                  <span>{transaction.category}</span>
                  <span>{transaction.paymentMethod}</span>
                  <strong className={transaction.amount > 0 ? "positive" : ""}>
                    {formatCurrency(transaction.amount)}
                  </strong>
                </div>
              ))
            ) : (
              <p className="empty-state">No transactions yet. Use Quick Entry to add your first one.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Net worth</p>
              <h2>Six Month Trend</h2>
            </div>
          </div>
          <div className="spark-bars">
            {netWorthTrend.length > 0 ? (
              netWorthTrend.map((point) => (
                <div key={point.month}>
                  <span style={{ height: `${point.index}%` }} />
                  <small>{point.month}</small>
                </div>
              ))
            ) : (
              <p className="empty-state">Your net-worth trend starts after monthly snapshots.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Budget</p>
              <h2>This Month</h2>
            </div>
          </div>
          <div className="stack">
            {budgetSnapshot.length > 0 ? (
              budgetSnapshot.map((budget) => (
                <div className="goal-row" key={budget.category}>
                  <div>
                    <strong>{budget.category}</strong>
                    <span>{formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}</span>
                  </div>
                  <ProgressBar value={Math.round((budget.spent / budget.limit) * 100)} />
                </div>
              ))
            ) : (
              <p className="empty-state">No budgets yet.</p>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
