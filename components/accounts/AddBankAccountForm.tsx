"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  bankAccountsStorageKey,
  readLocalBankAccounts,
  type LocalBankAccount,
} from "@/lib/local-finance";

export function AddBankAccountForm() {
  const [accounts, setAccounts] = useState<LocalBankAccount[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return readLocalBankAccounts();
  });
  const [draft, setDraft] = useState({
    bankName: "",
    accountName: "",
    accountType: "Savings",
    openingBalance: "",
  });

  useEffect(() => {
    window.localStorage.setItem(bankAccountsStorageKey, JSON.stringify(accounts));
  }, [accounts]);

  function saveBankAccount() {
    const balance = Number(draft.openingBalance);
    if (!draft.bankName.trim() || !draft.accountName.trim() || Number.isNaN(balance)) {
      return;
    }

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
          onClick={() => {
            window.localStorage.removeItem(bankAccountsStorageKey);
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
              <b>{formatCurrency(account.openingBalance)}</b>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
