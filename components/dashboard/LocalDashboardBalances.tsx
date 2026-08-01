"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  calculateAccountBalance,
  readLocalBankAccounts,
  readLocalQuickEntries,
  type LocalBankAccount,
  type LocalQuickEntry,
} from "@/lib/local-finance";
import {
  getSupabaseBrowserClient,
  getSupabaseUser,
  isSupabaseConfigured,
  type DbAccount,
  type DbTransaction,
} from "@/lib/supabase-client";

export function LocalDashboardBalances() {
  const [accounts, setAccounts] = useState<LocalBankAccount[]>([]);
  const [entries, setEntries] = useState<LocalQuickEntry[]>([]);
  const [mode, setMode] = useState<"local" | "database" | "setup">("local");

  useEffect(() => {
    async function refresh() {
      const supabase = getSupabaseBrowserClient();
      const user = await getSupabaseUser();

      if (supabase && user) {
        setMode("database");
        const [{ data: accountData }, { data: transactionData }] = await Promise.all([
          supabase.from("accounts").select("*").order("created_at", { ascending: false }),
          supabase.from("transactions").select("*").order("transaction_date", { ascending: false }),
        ]);

        setAccounts(
          ((accountData ?? []) as DbAccount[]).map((account) => ({
            id: account.id,
            accountName: account.account_name,
            accountType: account.account_type,
            bankName: account.bank_name,
            openingBalance: Number(account.opening_balance),
          })),
        );
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
        return;
      }

      setMode(isSupabaseConfigured() ? "setup" : "local");
      setAccounts(readLocalBankAccounts());
      setEntries(readLocalQuickEntries());
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const accountBalances = useMemo(
    () =>
      accounts.map((account) => ({
        ...account,
        calculatedBalance: calculateAccountBalance(account, entries),
      })),
    [accounts, entries],
  );
  const bankBalance = accountBalances.reduce(
    (total, account) => total + account.calculatedBalance,
    0,
  );
  const income = entries
    .filter((entry) => entry.type === "income")
    .reduce((total, entry) => total + entry.amount, 0);
  const expenses = entries
    .filter((entry) => entry.type === "expense")
    .reduce((total, entry) => total + entry.amount, 0);
  const savingsRate = income > 0 ? (income - expenses) / income : 0;

  return (
    <>
      <section className="metric-grid">
        <article className="metric-card">
          <span>Monthly income</span>
          <strong>{formatCurrency(income)}</strong>
          <small className="good">{entries.length} entries</small>
        </article>
        <article className="metric-card">
          <span>Bank balance</span>
          <strong>{formatCurrency(bankBalance)}</strong>
          <small className="good">{accounts.length} banks</small>
        </article>
        <article className="metric-card">
          <span>Expenses</span>
          <strong>{formatCurrency(expenses)}</strong>
          <small className="warn">{expenses > 0 ? "Tracked locally" : "No spends yet"}</small>
        </article>
        <article className="metric-card">
          <span>Savings rate</span>
          <strong>{formatPercent(savingsRate)}</strong>
          <small className="good">From saved entries</small>
        </article>
      </section>

      <section className="panel wide">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Current balances</p>
            <h2>Banks and local entries</h2>
            <p className="empty-state">
              {mode === "database"
                ? "Synced with your signed-in database."
                : mode === "setup"
                  ? "Sign in to sync with your database, or continue locally."
                  : "Using private browser storage."}
            </p>
          </div>
          <a className="primary-button link-button" href="/accounts#add-bank-account">
            Add bank
          </a>
        </div>
        <div className="balance-split">
          <div>
            <span>Total bank balance</span>
            <strong>{formatCurrency(bankBalance)}</strong>
            {accountBalances.length > 0 ? (
              accountBalances.map((account) => (
                <small key={account.id}>
                  {account.accountName}: {formatCurrency(account.calculatedBalance)}
                </small>
              ))
            ) : (
              <small>Add opening balance on Accounts, then add spends in Quick Entry.</small>
            )}
          </div>
          <div>
            <span>Local activity</span>
            <strong>{formatCurrency(income - expenses)}</strong>
            <small>Income: {formatCurrency(income)}</small>
            <small>Expenses: {formatCurrency(expenses)}</small>
          </div>
        </div>
      </section>
    </>
  );
}
