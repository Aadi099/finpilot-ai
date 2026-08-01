"use client";

import { useEffect, useMemo, useState } from "react";
import { accounts, categories, paymentMethods } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/format";

type EntryType = "expense" | "income" | "transfer";

type QuickEntry = {
  id: string;
  type: EntryType;
  amount: number;
  name: string;
  category: string;
  transactionDate: string;
  paidDate: string;
  paymentMethod: string;
  account: string;
  note: string;
};

const today = new Date().toISOString().slice(0, 10);

const defaultEntry: QuickEntry = {
  id: "",
  type: "expense",
  amount: 0,
  name: "",
  category: "Food",
  transactionDate: today,
  paidDate: today,
  paymentMethod: "UPI",
  account: "HDFC Salary Account",
  note: "",
};

export function QuickEntryForm() {
  const [entry, setEntry] = useState<QuickEntry>(defaultEntry);
  const [savedEntries, setSavedEntries] = useState<QuickEntry[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem("finpilot.quickEntries");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    window.localStorage.setItem("finpilot.quickEntries", JSON.stringify(savedEntries));
  }, [savedEntries]);

  const totalToday = useMemo(
    () =>
      savedEntries
        .filter((item) => item.transactionDate === today && item.type === "expense")
        .reduce((total, item) => total + item.amount, 0),
    [savedEntries],
  );

  function updateField<K extends keyof QuickEntry>(key: K, value: QuickEntry[K]) {
    setEntry((current) => ({ ...current, [key]: value }));
  }

  function saveEntry() {
    if (!entry.name.trim() || entry.amount <= 0) {
      return;
    }

    setSavedEntries((current) => [
      {
        ...entry,
        id: crypto.randomUUID(),
        paidDate:
          entry.paymentMethod === "Credit Card" && entry.paidDate === entry.transactionDate
            ? ""
            : entry.paidDate,
      },
      ...current,
    ]);
    setEntry({
      ...defaultEntry,
      category: entry.category,
      paymentMethod: entry.paymentMethod,
      account: entry.account,
      transactionDate: today,
      paidDate: today,
    });
  }

  return (
    <section className="quick-entry-layout">
      <div className="quick-card">
        <div className="segmented-control" aria-label="Entry type">
          {(["expense", "income", "transfer"] as EntryType[]).map((type) => (
            <button
              className={entry.type === type ? "selected" : ""}
              key={type}
              onClick={() => updateField("type", type)}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>

        <label className="amount-field">
          <span>Amount</span>
          <input
            inputMode="decimal"
            min="0"
            onChange={(event) => updateField("amount", Number(event.target.value))}
            placeholder="0"
            type="number"
            value={entry.amount || ""}
          />
        </label>

        <label>
          <span>Name</span>
          <input
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Swiggy, petrol, salary, friend transfer"
            type="text"
            value={entry.name}
          />
        </label>

        <div className="form-grid">
          <label>
            <span>Category</span>
            <select
              onChange={(event) => updateField("category", event.target.value)}
              value={entry.category}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Payment</span>
            <select
              onChange={(event) => updateField("paymentMethod", event.target.value)}
              value={entry.paymentMethod}
            >
              {paymentMethods.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label>
            <span>Expense date</span>
            <input
              onChange={(event) => updateField("transactionDate", event.target.value)}
              type="date"
              value={entry.transactionDate}
            />
          </label>
          <label>
            <span>Paid date</span>
            <input
              disabled={entry.paymentMethod === "Credit Card"}
              onChange={(event) => updateField("paidDate", event.target.value)}
              type="date"
              value={entry.paymentMethod === "Credit Card" ? "" : entry.paidDate}
            />
          </label>
        </div>

        <label>
          <span>Account</span>
          <select
            onChange={(event) => updateField("account", event.target.value)}
            value={entry.account}
          >
            {accounts.map((account) => (
              <option key={account.id}>{account.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Note</span>
          <textarea
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="Optional"
            rows={3}
            value={entry.note}
          />
        </label>

        <button className="primary-button big" onClick={saveEntry} type="button">
          Save entry
        </button>
      </div>

      <aside className="quick-summary">
        <div className="metric-card">
          <span>Today added</span>
          <strong>{formatCurrency(totalToday)}</strong>
          <small className="good">{savedEntries.length} local entries</small>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Suggested columns</p>
              <h2>Daily transaction fields</h2>
            </div>
          </div>
          <div className="field-list">
            {[
              "Type",
              "Amount",
              "Name",
              "Category",
              "Expense date",
              "Paid date",
              "Payment method",
              "Account",
              "Credit-card statement month",
              "Person/source",
              "Tags",
              "Notes",
              "Receipt",
            ].map((field) => (
              <span key={field}>{field}</span>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Recent quick entries</p>
              <h2>Saved on this phone</h2>
            </div>
          </div>
          <div className="stack">
            {savedEntries.slice(0, 5).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category} · {item.paymentMethod}</span>
                </div>
                <b>{formatCurrency(item.amount)}</b>
              </div>
            ))}
            {savedEntries.length === 0 ? (
              <p className="empty-state">Your quick entries will appear here.</p>
            ) : null}
          </div>
        </div>
      </aside>
    </section>
  );
}
