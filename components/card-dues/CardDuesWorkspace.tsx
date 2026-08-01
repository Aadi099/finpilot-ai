"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  calculateCardOutstanding,
  getCardCycleDates,
  quickEntriesStorageKey,
  readLocalBankAccounts,
  readLocalCreditCards,
  readLocalQuickEntries,
  type LocalBankAccount,
  type LocalCreditCard,
  type LocalQuickEntry,
} from "@/lib/local-finance";

export function CardDuesWorkspace() {
  const [cards] = useState<LocalCreditCard[]>(() => readLocalCreditCards());
  const [accounts] = useState<LocalBankAccount[]>(() => readLocalBankAccounts());
  const [entries, setEntries] = useState<LocalQuickEntry[]>(() => readLocalQuickEntries());
  const [payingCardId, setPayingCardId] = useState("");
  const [payment, setPayment] = useState({
    account: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const cardRows = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        ...getCardCycleDates(card),
        outstanding: calculateCardOutstanding(card, entries),
      })),
    [cards, entries],
  );

  function markPaid(card: LocalCreditCard) {
    const outstanding = calculateCardOutstanding(card, entries);
    setPayingCardId(card.id);
    setPayment((current) => ({
      ...current,
      account: accounts[0]?.accountName ?? "",
      amount: String(outstanding || card.minimumDue || ""),
    }));
  }

  function savePayment() {
    const card = cards.find((item) => item.id === payingCardId);
    const amount = Number(payment.amount);
    if (!card || !payment.account || amount <= 0) {
      return;
    }

    const nextEntries: LocalQuickEntry[] = [
      {
        id: crypto.randomUUID(),
        account: card.cardName,
        amount,
        category: "Transfer",
        name: `${card.cardName} bill paid`,
        note: `Paid from ${payment.account}`,
        paidDate: payment.date,
        paymentMethod: "Bank Transfer",
        transactionDate: payment.date,
        type: "transfer",
      },
      ...entries,
    ];
    window.localStorage.setItem(quickEntriesStorageKey, JSON.stringify(nextEntries));
    setEntries(nextEntries);
    setPayingCardId("");
  }

  return (
    <section className="dashboard-grid">
      {cardRows.map((card) => (
        <article className="panel card-due-panel" key={card.id}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{card.bankName}</p>
              <h2>{card.cardName}</h2>
            </div>
            <span className={card.daysLeft <= 3 ? "pill danger-pill" : "pill"}>
              {card.daysLeft >= 0 ? `${card.daysLeft} days left` : "Overdue"}
            </span>
          </div>
          <div className="snapshot-grid card-due-grid">
            <div>
              <span>Outstanding</span>
              <strong>{formatCurrency(card.outstanding)}</strong>
            </div>
            <div>
              <span>Minimum due</span>
              <strong>{formatCurrency(card.minimumDue)}</strong>
            </div>
            <div>
              <span>Statement date</span>
              <strong>{formatDate(card.statementDate)}</strong>
            </div>
            <div>
              <span>Due date</span>
              <strong>{formatDate(card.dueDate)}</strong>
            </div>
          </div>
          <div className="stack">
            <p className="empty-state">
              Current cycle transactions are detected from credit-card entries
              linked to this card.
            </p>
            {payingCardId === card.id ? (
              <div className="pay-form">
                <label>
                  <span>Paid from bank</span>
                  <select
                    onChange={(event) =>
                      setPayment((current) => ({ ...current, account: event.target.value }))
                    }
                    value={payment.account}
                  >
                    <option value="">Select bank</option>
                    {accounts.map((account) => (
                      <option key={account.id}>{account.accountName}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Amount</span>
                  <input
                    inputMode="decimal"
                    onChange={(event) =>
                      setPayment((current) => ({ ...current, amount: event.target.value }))
                    }
                    type="number"
                    value={payment.amount}
                  />
                </label>
                <label>
                  <span>Payment date</span>
                  <input
                    onChange={(event) =>
                      setPayment((current) => ({ ...current, date: event.target.value }))
                    }
                    type="date"
                    value={payment.date}
                  />
                </label>
                <button className="primary-button" onClick={savePayment} type="button">
                  Save payment
                </button>
              </div>
            ) : (
              <button className="primary-button" onClick={() => markPaid(card)} type="button">
                Mark as paid
              </button>
            )}
          </div>
        </article>
      ))}
      {cardRows.length === 0 ? (
        <section className="panel wide">
          <p className="eyebrow">Card dues</p>
          <h2>No credit cards yet</h2>
          <p className="empty-state">
            Add a credit card in Balances, then credit-card spends will appear here.
          </p>
          <a className="primary-button link-button" href="/balances">
            Add credit card
          </a>
        </section>
      ) : null}
    </section>
  );
}
