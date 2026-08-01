"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { getMonthKey, readLocalQuickEntries, type LocalQuickEntry } from "@/lib/local-finance";
import {
  getSupabaseBrowserClient,
  getSupabaseUser,
  type DbTransaction,
} from "@/lib/supabase-client";

export function ReportsWorkspace() {
  const [entries, setEntries] = useState<LocalQuickEntry[]>([]);
  const [month, setMonth] = useState(getMonthKey());

  useEffect(() => {
    async function loadEntries() {
      const supabase = getSupabaseBrowserClient();
      const user = await getSupabaseUser();
      if (supabase && user) {
        const { data } = await supabase.from("transactions").select("*");
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
  }, []);

  const monthEntries = useMemo(
    () => entries.filter((entry) => entry.transactionDate.startsWith(month)),
    [entries, month],
  );
  const income = monthEntries
    .filter((entry) => entry.type === "income")
    .reduce((total, entry) => total + entry.amount, 0);
  const expense = monthEntries
    .filter((entry) => entry.type === "expense")
    .reduce((total, entry) => total + entry.amount, 0);
  const topRows = Object.entries(
    monthEntries
      .filter((entry) => entry.type === "expense")
      .reduce<Record<string, number>>((totals, entry) => {
        totals[entry.name] = (totals[entry.name] ?? 0) + entry.amount;
        return totals;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  function exportCsv() {
    const header = "type,amount,name,category,date,paid_date,payment,account,note";
    const rows = monthEntries.map((entry) =>
      [
        entry.type,
        entry.amount,
        entry.name,
        entry.category,
        entry.transactionDate,
        entry.paidDate,
        entry.paymentMethod,
        entry.account,
        entry.note,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finpilot-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="dashboard-grid">
      <div className="panel wide">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Monthly report</p>
            <h2>{month}</h2>
          </div>
          <div className="button-row">
            <input
              className="month-input"
              onChange={(event) => setMonth(event.target.value)}
              type="month"
              value={month}
            />
            <button className="ghost-button" onClick={exportCsv} type="button">
              CSV
            </button>
            <button className="primary-button" onClick={() => window.print()} type="button">
              PDF
            </button>
          </div>
        </div>
        <div className="snapshot-grid">
          <div>
            <span>Total income</span>
            <strong>{formatCurrency(income)}</strong>
          </div>
          <div>
            <span>Total expense</span>
            <strong>{formatCurrency(expense)}</strong>
          </div>
          <div>
            <span>Net savings</span>
            <strong>{formatCurrency(income - expense)}</strong>
          </div>
          <div>
            <span>Entries</span>
            <strong>{monthEntries.length}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">Top merchants/people</p>
        <h2>Biggest spends</h2>
        <div className="stack">
          {topRows.map(([name, amount]) => (
            <div className="list-row" key={name}>
              <strong>{name}</strong>
              <b>{formatCurrency(amount)}</b>
            </div>
          ))}
          {topRows.length === 0 ? <p className="empty-state">No spending yet.</p> : null}
        </div>
      </div>

      <div className="panel wide">
        <p className="eyebrow">Observations</p>
        <h2>Notes for this month</h2>
        <p className="empty-state">
          This area will become smarter later. For now it summarizes totals,
          exports CSV, and opens a print-ready PDF view.
        </p>
      </div>
    </section>
  );
}
