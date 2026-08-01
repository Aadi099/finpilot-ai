"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, paymentMethods } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/format";
import {
  quickEntriesStorageKey,
  readLocalBankAccounts,
  readLocalCreditCards,
  readLocalQuickEntries,
  type LocalBankAccount,
  type LocalCreditCard,
} from "@/lib/local-finance";
import {
  getSupabaseBrowserClient,
  getSupabaseUser,
  isSupabaseConfigured,
  type DbAccount,
  type DbTransaction,
} from "@/lib/supabase-client";

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
  account: "",
  note: "",
};

export function QuickEntryForm() {
  const [isDatabaseMode, setIsDatabaseMode] = useState(false);
  const [entry, setEntry] = useState<QuickEntry>(defaultEntry);
  const [savedEntries, setSavedEntries] = useState<QuickEntry[]>(() => {
    return readLocalQuickEntries();
  });
  const [localAccounts, setLocalAccounts] = useState<LocalBankAccount[]>(() => {
    return readLocalBankAccounts();
  });
  const [localCreditCards, setLocalCreditCards] = useState<LocalCreditCard[]>(() => {
    return readLocalCreditCards();
  });

  useEffect(() => {
    if (!isDatabaseMode) {
      window.localStorage.setItem(quickEntriesStorageKey, JSON.stringify(savedEntries));
    }
  }, [savedEntries, isDatabaseMode]);

  useEffect(() => {
    async function refreshAccounts() {
      const supabase = getSupabaseBrowserClient();
      const user = await getSupabaseUser();

      if (supabase && user) {
        setIsDatabaseMode(true);
        const [{ data: accountData }, { data: transactionData }] = await Promise.all([
          supabase.from("accounts").select("*").order("created_at", { ascending: false }),
          supabase.from("transactions").select("*").order("transaction_date", { ascending: false }),
        ]);

        setLocalAccounts(
          ((accountData ?? []) as DbAccount[]).map((account) => ({
            id: account.id,
            accountName: account.account_name,
            accountType: account.account_type,
            bankName: account.bank_name,
            openingBalance: Number(account.opening_balance),
          })),
        );
        setLocalCreditCards(readLocalCreditCards());
        setSavedEntries(
          ((transactionData ?? []) as DbTransaction[]).map((transaction) => ({
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
      } else {
        setLocalAccounts(readLocalBankAccounts());
        setLocalCreditCards(readLocalCreditCards());
      }
    }

    refreshAccounts();
    window.addEventListener("focus", refreshAccounts);
    window.addEventListener("storage", refreshAccounts);

    return () => {
      window.removeEventListener("focus", refreshAccounts);
      window.removeEventListener("storage", refreshAccounts);
    };
  }, []);

  const totalToday = useMemo(
    () =>
      savedEntries
        .filter((item) => item.transactionDate === today && item.type === "expense")
        .reduce((total, item) => total + item.amount, 0),
    [savedEntries],
  );
  const accountChoices =
    entry.paymentMethod === "Credit Card"
      ? localCreditCards.map((card) => ({ id: card.id, name: card.cardName }))
      : localAccounts.map((account) => ({ id: account.id, name: account.accountName }));

  function updateField<K extends keyof QuickEntry>(key: K, value: QuickEntry[K]) {
    setEntry((current) => ({ ...current, [key]: value }));
  }

  async function saveEntry() {
    if (!entry.name.trim() || entry.amount <= 0) {
      return;
    }

    const nextEntry = {
      ...entry,
      id: crypto.randomUUID(),
      paidDate:
        entry.paymentMethod === "Credit Card" && entry.paidDate === entry.transactionDate
          ? ""
          : entry.paidDate,
    };

    const supabase = getSupabaseBrowserClient();
    const user = await getSupabaseUser();
    if (supabase && user) {
      const account = localAccounts.find((item) => item.accountName === entry.account);
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          account_id: account?.id ?? null,
          account_name: entry.account || "Unassigned",
          amount: entry.amount,
          category: entry.category,
          name: entry.name.trim(),
          notes: entry.note.trim() || null,
          paid_date: nextEntry.paidDate || null,
          payment_method: entry.paymentMethod,
          transaction_date: entry.transactionDate,
          type: entry.type,
          user_id: user.id,
        })
        .select()
        .single();

      if (!error && data) {
        const transaction = data as DbTransaction;
        setIsDatabaseMode(true);
        setSavedEntries((current) => [
          {
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
          },
          ...current,
        ]);
      }
    } else {
      setSavedEntries((current) => [nextEntry, ...current]);
    }

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
        <div className={`type-helper ${entry.type}`}>
          <strong>
            {entry.type === "expense"
              ? "Expense reduces your balance"
              : entry.type === "income"
                ? "Income adds money"
                : "Transfer moves your own money"}
          </strong>
          <span>
            {entry.type === "expense"
              ? "Use for food, bills, shopping, UPI payments, card spends, fees, and any money going out."
              : entry.type === "income"
                ? "Use for salary, refunds, cashbacks, interest, or money someone sends to you."
                : "Use when moving money between your own accounts, like ICICI to wallet or bank to investment. It should not count as income or expense."}
          </span>
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
            <span>{entry.paymentMethod === "Credit Card" ? "Credit card" : "Account"}</span>
            <select
              onChange={(event) => updateField("account", event.target.value)}
              value={entry.account}
            >
              <option value="">
                {entry.paymentMethod === "Credit Card"
                  ? "Select card after adding one"
                  : "Select account after adding one"}
              </option>
              {accountChoices.map((account) => (
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
        <button
          className="ghost-button big"
          onClick={async () => {
            const supabase = getSupabaseBrowserClient();
            const user = await getSupabaseUser();
            if (supabase && user) {
              await supabase.from("transactions").delete().eq("user_id", user.id);
            }
            window.localStorage.removeItem(quickEntriesStorageKey);
            setSavedEntries([]);
          }}
          type="button"
        >
          Clear saved quick entries
        </button>
        <p className="empty-state">
          {isDatabaseMode
            ? "Saving to your signed-in database workspace."
            : isSupabaseConfigured()
              ? "Sign in to save these entries to your database."
              : "Saving privately in this browser until Supabase is configured."}
        </p>
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
