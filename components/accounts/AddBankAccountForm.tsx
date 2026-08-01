"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";

type LocalBankAccount = {
  id: string;
  bankName: string;
  accountName: string;
  accountType: string;
  currentBalance: number;
};

const storageKey = "finpilot.bankAccounts";

export function AddBankAccountForm() {
  const [accounts, setAccounts] = useState<LocalBankAccount[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [draft, setDraft] = useState({
    bankName: "",
    accountName: "",
    accountType: "Savings",
    currentBalance: "",
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(accounts));
  }, [accounts]);

  function saveBankAccount() {
    const balance = Number(draft.currentBalance);
    if (!draft.bankName.trim() || !draft.accountName.trim() || Number.isNaN(balance)) {
      return;
    }

    setAccounts((current) => [
      {
        id: crypto.randomUUID(),
        bankName: draft.bankName.trim(),
        accountName: draft.accountName.trim(),
        accountType: draft.accountType,
        currentBalance: balance,
      },
      ...current,
    ]);
    setDraft({
      bankName: "",
      accountName: "",
      accountType: "Savings",
      currentBalance: "",
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
          <span>Current balance</span>
          <input
            inputMode="decimal"
            onChange={(event) => setDraft((current) => ({ ...current, currentBalance: event.target.value }))}
            placeholder="0"
            type="number"
            value={draft.currentBalance}
          />
        </label>
        <button className="primary-button big" onClick={saveBankAccount} type="button">
          Save bank account
        </button>
        <button
          className="ghost-button big"
          onClick={() => {
            window.localStorage.removeItem(storageKey);
            setAccounts([]);
          }}
          type="button"
        >
          Clear saved banks
        </button>
      </div>
      {accounts.length > 0 ? (
        <div className="local-bank-list">
          {accounts.map((account) => (
            <div className="list-row" key={account.id}>
              <div>
                <strong>{account.accountName}</strong>
                <span>{account.bankName} · {account.accountType}</span>
              </div>
              <b>{formatCurrency(account.currentBalance)}</b>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
