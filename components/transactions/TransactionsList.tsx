"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  quickEntriesStorageKey,
  readLocalBankAccounts,
  readLocalQuickEntries,
  type LocalBankAccount,
  type LocalQuickEntry,
} from "@/lib/local-finance";
import { categories, paymentMethods } from "@/lib/sample-data";
import {
  getSupabaseBrowserClient,
  getSupabaseUser,
  type DbAccount,
  type DbTransaction,
} from "@/lib/supabase-client";

export function TransactionsList() {
  const [entries, setEntries] = useState<LocalQuickEntry[]>([]);
  const [accounts, setAccounts] = useState<LocalBankAccount[]>([]);
  const [editing, setEditing] = useState<LocalQuickEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDatabaseMode, setIsDatabaseMode] = useState(false);

  useEffect(() => {
    async function loadEntries() {
      const supabase = getSupabaseBrowserClient();
      const user = await getSupabaseUser();

      if (supabase && user) {
        setIsDatabaseMode(true);
        const [{ data: transactionData }, { data: accountData }] = await Promise.all([
          supabase
            .from("transactions")
            .select("*")
            .order("transaction_date", { ascending: false }),
          supabase.from("accounts").select("*").order("created_at", { ascending: false }),
        ]);

        setEntries(
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
        setAccounts(
          ((accountData ?? []) as DbAccount[]).map((account) => ({
            id: account.id,
            accountName: account.account_name,
            accountType: account.account_type,
            bankName: account.bank_name,
            openingBalance: Number(account.opening_balance),
          })),
        );
        return;
      }

      setIsDatabaseMode(false);
      setEntries(readLocalQuickEntries());
      setAccounts(readLocalBankAccounts());
    }

    loadEntries();
  }, []);

  function updateEditing<K extends keyof LocalQuickEntry>(
    key: K,
    value: LocalQuickEntry[K],
  ) {
    setEditing((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveEdit() {
    if (!editing || !editing.name.trim() || editing.amount <= 0) {
      return;
    }

    setIsSaving(true);
    const normalizedEntry = {
      ...editing,
      name: editing.name.trim(),
      note: editing.note.trim(),
      paidDate:
        editing.paymentMethod === "Credit Card" && editing.paidDate === editing.transactionDate
          ? ""
          : editing.paidDate,
    };

    const supabase = getSupabaseBrowserClient();
    const user = await getSupabaseUser();

    if (supabase && user) {
      const account = accounts.find((item) => item.accountName === normalizedEntry.account);
      const { error } = await supabase
        .from("transactions")
        .update({
          account_id: account?.id ?? null,
          account_name: normalizedEntry.account || "Unassigned",
          amount: normalizedEntry.amount,
          category: normalizedEntry.category,
          name: normalizedEntry.name,
          notes: normalizedEntry.note || null,
          paid_date: normalizedEntry.paidDate || null,
          payment_method: normalizedEntry.paymentMethod,
          transaction_date: normalizedEntry.transactionDate,
          type: normalizedEntry.type,
        })
        .eq("id", normalizedEntry.id)
        .eq("user_id", user.id);

      if (error) {
        setIsSaving(false);
        return;
      }
    } else {
      window.localStorage.setItem(
        quickEntriesStorageKey,
        JSON.stringify(
          entries.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry)),
        ),
      );
    }

    setEntries((current) =>
      current.map((entry) => (entry.id === normalizedEntry.id ? normalizedEntry : entry)),
    );
    setEditing(null);
    setIsSaving(false);
  }

  if (entries.length === 0) {
    return <p className="empty-state">No transactions yet. Start with Quick Entry.</p>;
  }

  return (
    <>
      {entries.map((transaction) => (
        <article className="transaction-card" key={transaction.id}>
          <div>
            <strong>{transaction.name}</strong>
            <span>{transaction.category} · {transaction.account || "Unassigned"}</span>
          </div>
          <div>
            <strong
              className={
                transaction.type === "income"
                  ? "positive"
                  : transaction.type === "transfer"
                    ? "neutral"
                    : ""
              }
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </strong>
            <span>
              {formatDate(transaction.transactionDate)}
              {transaction.paidDate ? ` · paid ${formatDate(transaction.paidDate)}` : ""}
            </span>
          </div>
          <span className="payment-chip">{transaction.paymentMethod}</span>
          <div className="transaction-actions">
            <span className={`status ${transaction.type}`}>{transaction.type}</span>
            <button
              className="ghost-button small-button"
              onClick={() => setEditing(transaction)}
              type="button"
            >
              Edit
            </button>
          </div>
        </article>
      ))}

      {editing ? (
        <div className="edit-sheet" role="dialog" aria-modal="true" aria-label="Edit transaction">
          <div className="edit-sheet-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Edit transaction</p>
                <h2>{editing.name || "Transaction"}</h2>
                <p className="empty-state">
                  {isDatabaseMode
                    ? "Changes save to your signed-in database."
                    : "Changes save locally in this browser."}
                </p>
              </div>
              <button className="ghost-button" onClick={() => setEditing(null)} type="button">
                Close
              </button>
            </div>

            <div className="edit-form">
              <label>
                <span>Type</span>
                <select
                  onChange={(event) =>
                    updateEditing("type", event.target.value as LocalQuickEntry["type"])
                  }
                  value={editing.type}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
              </label>
              <label>
                <span>Amount</span>
                <input
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => updateEditing("amount", Number(event.target.value))}
                  type="number"
                  value={editing.amount || ""}
                />
              </label>
              <label>
                <span>Name</span>
                <input
                  onChange={(event) => updateEditing("name", event.target.value)}
                  type="text"
                  value={editing.name}
                />
              </label>
              <label>
                <span>Category</span>
                <select
                  onChange={(event) => updateEditing("category", event.target.value)}
                  value={editing.category}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Payment</span>
                <select
                  onChange={(event) => updateEditing("paymentMethod", event.target.value)}
                  value={editing.paymentMethod}
                >
                  {paymentMethods.map((method) => (
                    <option key={method}>{method}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Account</span>
                <select
                  onChange={(event) => updateEditing("account", event.target.value)}
                  value={editing.account}
                >
                  <option value="">Unassigned</option>
                  {accounts.map((account) => (
                    <option key={account.id}>{account.accountName}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Transaction date</span>
                <input
                  onChange={(event) => updateEditing("transactionDate", event.target.value)}
                  type="date"
                  value={editing.transactionDate}
                />
              </label>
              <label>
                <span>Paid date</span>
                <input
                  disabled={editing.paymentMethod === "Credit Card"}
                  onChange={(event) => updateEditing("paidDate", event.target.value)}
                  type="date"
                  value={editing.paymentMethod === "Credit Card" ? "" : editing.paidDate}
                />
              </label>
              <label className="edit-form-wide">
                <span>Note</span>
                <textarea
                  onChange={(event) => updateEditing("note", event.target.value)}
                  rows={3}
                  value={editing.note}
                />
              </label>
            </div>

            <div className="button-row">
              <button className="primary-button" disabled={isSaving} onClick={saveEdit} type="button">
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button className="ghost-button" onClick={() => setEditing(null)} type="button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
