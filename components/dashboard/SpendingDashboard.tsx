"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  readLocalQuickEntries,
  type LocalQuickEntry,
} from "@/lib/local-finance";
import {
  getSupabaseBrowserClient,
  getSupabaseUser,
  type DbTransaction,
} from "@/lib/supabase-client";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function SpendingDashboard() {
  const [entries, setEntries] = useState<LocalQuickEntry[]>([]);
  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    async function loadEntries() {
      const supabase = getSupabaseBrowserClient();
      const user = await getSupabaseUser();
      if (supabase && user) {
        const { data } = await supabase
          .from("transactions")
          .select("*")
          .order("transaction_date", { ascending: false });

        setEntries(
          ((data ?? []) as DbTransaction[]).map((transaction) => ({
            id: transaction.id,
            account: transaction.account_name,
            amount: Number(transaction.amount),
            category: transaction.category,
            name: transaction.name,
            note: transaction.notes ?? "",
            paidDate: transaction.paid_date ?? "",
            paymentMethod: transaction.payment_method,
            transactionDate: transaction.transaction_date,
            type: transaction.type,
          })),
        );
        return;
      }

      setEntries(readLocalQuickEntries());
    }

    loadEntries();
    window.addEventListener("focus", loadEntries);
    return () => window.removeEventListener("focus", loadEntries);
  }, []);

  const monthEntries = useMemo(
    () => entries.filter((entry) => entry.transactionDate.startsWith(month)),
    [entries, month],
  );
  const expenses = monthEntries.filter((entry) => entry.type === "expense");
  const income = monthEntries.filter((entry) => entry.type === "income");
  const totalExpense = expenses.reduce((total, entry) => total + entry.amount, 0);
  const totalIncome = income.reduce((total, entry) => total + entry.amount, 0);
  const [selectedYear, selectedMonth] = month.split("-").map(Number);
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysElapsed = month === currentMonth() ? new Date().getDate() : daysInSelectedMonth;
  const dailyAverage = totalExpense / Math.max(daysElapsed, 1);
  const categoryRows = Object.entries(
    expenses.reduce<Record<string, number>>((totals, entry) => {
      totals[entry.category] = (totals[entry.category] ?? 0) + entry.amount;
      return totals;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(...categoryRows.map(([, amount]) => amount), 1);
  const cashflow = totalIncome - totalExpense;

  return (
    <>
      <section className="metric-grid">
        <article className="metric-card hero-metric">
          <span>Monthly expense</span>
          <strong>{formatCurrency(totalExpense)}</strong>
          <small className="warn">{expenses.length} spends tracked</small>
        </article>
        <article className="metric-card">
          <span>Daily average</span>
          <strong>{formatCurrency(dailyAverage)}</strong>
          <small className="good">Based on selected month</small>
        </article>
        <article className="metric-card">
          <span>Income</span>
          <strong>{formatCurrency(totalIncome)}</strong>
          <small className="good">{income.length} incoming entries</small>
        </article>
        <article className="metric-card">
          <span>Cashflow</span>
          <strong>{formatCurrency(cashflow)}</strong>
          <small className={cashflow >= 0 ? "good" : "warn"}>
            {cashflow >= 0 ? "Positive" : "Negative"}
          </small>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Categories</p>
              <h2>Where money went</h2>
            </div>
            <input
              className="month-input"
              onChange={(event) => setMonth(event.target.value)}
              type="month"
              value={month}
            />
          </div>
          <div className="category-chart">
            {categoryRows.map(([category, amount]) => (
              <div className="category-bar" key={category}>
                <div>
                  <strong>{category}</strong>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <div className="budget-track">
                  <span style={{ width: `${Math.max(8, (amount / maxCategory) * 100)}%` }} />
                </div>
              </div>
            ))}
            {categoryRows.length === 0 ? (
              <p className="empty-state">No expenses for this month yet.</p>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Trend</p>
              <h2>Cashflow pulse</h2>
            </div>
          </div>
          <div className="cashflow-card">
            <strong>{formatCurrency(cashflow)}</strong>
            <span>
              {formatCurrency(totalIncome)} in · {formatCurrency(totalExpense)} out
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
