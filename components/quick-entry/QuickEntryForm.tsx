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
  transferToAccount?: string;
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
  transferToAccount: "",
  note: "",
};

const expenseCategories = categories.filter(
  (category) => !["Income", "Money Received", "Transfer"].includes(category),
);
const incomeCategories = ["Income", "Money Received", "Other"];

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
            transferToAccount: transaction.notes?.match(/^Transfer to: (.+)$/)?.[1] ?? "",
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
  const bankAccountChoices = localAccounts.map((account) => ({
    id: account.id,
    name: account.accountName,
  }));
  const visibleCategories = entry.type === "income" ? incomeCategories : expenseCategories;

  function updateField<K extends keyof QuickEntry>(key: K, value: QuickEntry[K]) {
    setEntry((current) => ({ ...current, [key]: value }));
  }

  function updateType(type: EntryType) {
    setEntry((current) => ({
      ...current,
      account: "",
      category: type === "income" ? "Income" : type === "transfer" ? "Transfer" : "Food",
      name: "",
      paidDate: today,
      paymentMethod: type === "transfer" ? "Bank Transfer" : current.paymentMethod,
      transactionDate: today,
      transferToAccount: "",
      type,
    }));
  }

  async function saveEntry() {
    if (entry.amount <= 0) {
      return;
    }

    if (entry.type !== "transfer" && !entry.name.trim()) {
      return;
    }

    if (entry.type === "transfer" && (!entry.account || !entry.transferToAccount)) {
      return;
    }

    const entryName =
      entry.type === "transfer"
        ? `${entry.account} to ${entry.transferToAccount}`
        : entry.name.trim();
    const nextEntry = {
      ...entry,
      category: entry.type === "transfer" ? "Transfer" : entry.category,
      id: crypto.randomUUID(),
      name: entryName,
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
          category: nextEntry.category,
          name: entryName,
          notes:
            entry.type === "transfer"
              ? `Transfer to: ${entry.transferToAccount}`
              : entry.note.trim() || null,
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
            transferToAccount: transaction.notes?.match(/^Transfer to: (.+)$/)?.[1] ?? "",
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
      transferToAccount: "",
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
              onClick={() => updateType(type)}
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
          <span>
            {entry.type === "income"
              ? "Received from / Source"
              : entry.type === "transfer"
                ? "Reference"
                : "Paid to / Name"}
          </span>
          <input
            onChange={(event) => updateField("name", event.target.value)}
            placeholder={
              entry.type === "income"
                ? "Salary, refund, cashback, friend"
                : entry.type === "transfer"
                  ? "Optional reference"
                  : "Swiggy, petrol, rent, CRED"
            }
            type="text"
            value={entry.name}
          />
        </label>

        {entry.type === "transfer" ? null : (
          <div className="form-grid">
            <label>
              <span>{entry.type === "income" ? "Income type" : "Category"}</span>
              <select
                onChange={(event) => updateField("category", event.target.value)}
                value={entry.category}
              >
                {visibleCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{entry.type === "income" ? "Received mode" : "Payment method"}</span>
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
        )}

        <div className="form-grid">
          <label>
            <span>
              {entry.type === "income"
                ? "Received date"
                : entry.type === "transfer"
                  ? "Transfer date"
                  : "Expense date"}
            </span>
            <input
              onChange={(event) => updateField("transactionDate", event.target.value)}
              type="date"
              value={entry.transactionDate}
            />
          </label>
          {entry.type === "expense" ? (
            <label>
              <span>Paid date</span>
              <input
                disabled={entry.paymentMethod === "Credit Card"}
                onChange={(event) => updateField("paidDate", event.target.value)}
                type="date"
                value={entry.paymentMethod === "Credit Card" ? "" : entry.paidDate}
              />
            </label>
          ) : null}
          {entry.type === "transfer" ? (
            <label>
              <span>Posted date</span>
              <input
                onChange={(event) => updateField("paidDate", event.target.value)}
                type="date"
                value={entry.paidDate}
              />
            </label>
          ) : null}
        </div>

        {entry.type === "transfer" ? (
          <div className="form-grid">
            <label>
              <span>From account</span>
              <select
                onChange={(event) => updateField("account", event.target.value)}
                value={entry.account}
              >
                <option value="">Select source account</option>
                {bankAccountChoices.map((account) => (
                  <option key={account.id}>{account.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>To account</span>
              <select
                onChange={(event) => updateField("transferToAccount", event.target.value)}
                value={entry.transferToAccount}
              >
                <option value="">Select destination account</option>
                {bankAccountChoices
                  .filter((account) => account.name !== entry.account)
                  .map((account) => (
                    <option key={account.id}>{account.name}</option>
                  ))}
              </select>
            </label>
          </div>
        ) : (
          <label>
            <span>
              {entry.type === "income"
                ? "Deposited to account"
                : entry.paymentMethod === "Credit Card"
                  ? "Credit card"
                  : "Account"}
            </span>
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
        )}

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
