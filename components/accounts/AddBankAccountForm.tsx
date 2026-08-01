"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  bankAccountsStorageKey,
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

export function AddBankAccountForm() {
  const [isDatabaseMode, setIsDatabaseMode] = useState(false);
  const [accounts, setAccounts] = useState<LocalBankAccount[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return readLocalBankAccounts();
  });
  const [entries, setEntries] = useState<LocalQuickEntry[]>(() => readLocalQuickEntries());
  const [draft, setDraft] = useState({
    bankName: "",
    accountName: "",
    accountType: "Savings",
    openingBalance: "",
  });

  useEffect(() => {
    async function loadDatabaseAccounts() {
      const supabase = getSupabaseBrowserClient();
      const user = await getSupabaseUser();
      if (!supabase || !user) {
        return;
      }

      setIsDatabaseMode(true);
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
          transferToAccount: transaction.notes?.match(/^Transfer to: (.+)$/)?.[1] ?? "",
          type: transaction.type,
        })),
      );
    }

    loadDatabaseAccounts();
  }, []);

  useEffect(() => {
    if (!isDatabaseMode) {
      window.localStorage.setItem(bankAccountsStorageKey, JSON.stringify(accounts));
    }
  }, [accounts, isDatabaseMode]);

  async function saveBankAccount() {
    const balance = Number(draft.openingBalance);
    if (!draft.bankName.trim() || !draft.accountName.trim() || Number.isNaN(balance)) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const user = await getSupabaseUser();
    if (supabase && user) {
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          account_name: draft.accountName.trim(),
          account_type: draft.accountType,
          bank_name: draft.bankName.trim(),
          opening_balance: balance,
          user_id: user.id,
        })
        .select()
        .single();

      if (!error && data) {
        const account = data as DbAccount;
        setIsDatabaseMode(true);
        setAccounts((current) => [
          {
            id: account.id,
            bankName: account.bank_name,
            accountName: account.account_name,
            accountType: account.account_type,
            openingBalance: Number(account.opening_balance),
          },
          ...current,
        ]);
      }
    } else {
      setAccounts((current) => [
        {
          id: crypto.randomUUID(),
          bankName: draft.bankName.trim(),
          accountName: draft.accountName.trim(),
          accountType: draft.accountType,
          openingBalance: balance,
        },
        ...current,
      ]);
    }

    setDraft({
      bankName: "",
      accountName: "",
      accountType: "Savings",
      openingBalance: "",
    });
  }

  return (
    <section className="panel add-bank-panel" id="add-bank-account">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Add bank</p>
          <h2>Add another bank account</h2>
        </div>
      </div>
      <div className="bank-form">
        <label>
          <span>Bank name</span>
          <input
            onChange={(event) => setDraft((current) => ({ ...current, bankName: event.target.value }))}
            placeholder="HDFC, SBI, Axis"
            value={draft.bankName}
          />
        </label>
        <label>
          <span>Account name</span>
          <input
            onChange={(event) => setDraft((current) => ({ ...current, accountName: event.target.value }))}
            placeholder="Salary, emergency, joint"
            value={draft.accountName}
          />
        </label>
        <label>
          <span>Type</span>
          <select
            onChange={(event) => setDraft((current) => ({ ...current, accountType: event.target.value }))}
            value={draft.accountType}
          >
            <option>Savings</option>
            <option>Current</option>
            <option>Salary</option>
            <option>Joint</option>
          </select>
        </label>
        <label>
          <span>Opening balance</span>
          <input
            inputMode="decimal"
            onChange={(event) => setDraft((current) => ({ ...current, openingBalance: event.target.value }))}
            placeholder="0"
            type="number"
            value={draft.openingBalance}
          />
        </label>
        <button className="primary-button big" onClick={saveBankAccount} type="button">
          Save bank account
        </button>
        <button
          className="ghost-button big"
          onClick={async () => {
            const supabase = getSupabaseBrowserClient();
            const user = await getSupabaseUser();
            if (supabase && user) {
              await supabase.from("accounts").delete().eq("user_id", user.id);
            }
            window.localStorage.removeItem(bankAccountsStorageKey);
            setAccounts([]);
            setEntries(readLocalQuickEntries());
          }}
          type="button"
        >
          Clear saved banks
        </button>
      </div>
      <p className="empty-state">
        {isDatabaseMode
          ? "Saving to your signed-in database workspace."
          : isSupabaseConfigured()
            ? "Sign in to save these accounts to your database."
            : "Saving privately in this browser until Supabase is configured."}
      </p>
      {accounts.length > 0 ? (
        <div className="local-bank-list">
          {accounts.map((account) => {
            const currentBalance = calculateAccountBalance(account, entries);
            const movement = currentBalance - account.openingBalance;

            return (
              <div className="list-row" key={account.id}>
                <div>
                  <strong>{account.accountName}</strong>
                  <span>
                    {account.bankName} · {account.accountType} · Opening{" "}
                    {formatCurrency(account.openingBalance)} · Movement{" "}
                    {formatCurrency(movement)}
                  </span>
                </div>
                <b>{formatCurrency(currentBalance)}</b>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
