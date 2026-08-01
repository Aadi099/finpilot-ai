"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  calculateCardOutstanding,
  creditCardsStorageKey,
  readLocalCreditCards,
  readLocalQuickEntries,
  type LocalCreditCard,
} from "@/lib/local-finance";

const blankCard = {
  bankName: "",
  cardName: "",
  creditLimit: "",
  dueDay: "2",
  lastFour: "",
  minimumDue: "",
  openingOutstanding: "",
  statementDay: "15",
};

export function CreditCardManager() {
  const [cards, setCards] = useState<LocalCreditCard[]>(() => readLocalCreditCards());
  const [draft, setDraft] = useState(blankCard);

  useEffect(() => {
    window.localStorage.setItem(creditCardsStorageKey, JSON.stringify(cards));
  }, [cards]);

  const entries = readLocalQuickEntries();
  const totalOutstanding = cards.reduce(
    (total, card) => total + calculateCardOutstanding(card, entries),
    0,
  );

  function saveCard() {
    if (!draft.cardName.trim() || !draft.bankName.trim()) {
      return;
    }

    setCards((current) => [
      {
        id: crypto.randomUUID(),
        bankName: draft.bankName.trim(),
        cardName: draft.cardName.trim(),
        creditLimit: Number(draft.creditLimit) || 0,
        dueDay: Number(draft.dueDay) || 2,
        lastFour: draft.lastFour.trim(),
        minimumDue: Number(draft.minimumDue) || 0,
        openingOutstanding: Number(draft.openingOutstanding) || 0,
        statementDay: Number(draft.statementDay) || 15,
      },
      ...current,
    ]);
    setDraft(blankCard);
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Credit cards</p>
          <h2>Cards and outstanding</h2>
          <p className="empty-state">
            Card spends count as expenses immediately. Bank balance reduces only
            when you mark the bill paid.
          </p>
        </div>
        <span className="pill">{formatCurrency(totalOutstanding)} due</span>
      </div>

      <div className="card-form">
        <label>
          <span>Card name</span>
          <input
            onChange={(event) => setDraft((current) => ({ ...current, cardName: event.target.value }))}
            placeholder="Amazon Pay ICICI"
            value={draft.cardName}
          />
        </label>
        <label>
          <span>Bank</span>
          <input
            onChange={(event) => setDraft((current) => ({ ...current, bankName: event.target.value }))}
            placeholder="ICICI"
            value={draft.bankName}
          />
        </label>
        <label>
          <span>Last 4</span>
          <input
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => setDraft((current) => ({ ...current, lastFour: event.target.value }))}
            placeholder="1234"
            value={draft.lastFour}
          />
        </label>
        <label>
          <span>Credit limit</span>
          <input
            inputMode="decimal"
            onChange={(event) => setDraft((current) => ({ ...current, creditLimit: event.target.value }))}
            placeholder="0"
            type="number"
            value={draft.creditLimit}
          />
        </label>
        <label>
          <span>Statement day</span>
          <input
            inputMode="numeric"
            max="31"
            min="1"
            onChange={(event) => setDraft((current) => ({ ...current, statementDay: event.target.value }))}
            type="number"
            value={draft.statementDay}
          />
        </label>
        <label>
          <span>Due day</span>
          <input
            inputMode="numeric"
            max="31"
            min="1"
            onChange={(event) => setDraft((current) => ({ ...current, dueDay: event.target.value }))}
            type="number"
            value={draft.dueDay}
          />
        </label>
        <label>
          <span>Opening due</span>
          <input
            inputMode="decimal"
            onChange={(event) => setDraft((current) => ({ ...current, openingOutstanding: event.target.value }))}
            placeholder="0"
            type="number"
            value={draft.openingOutstanding}
          />
        </label>
        <label>
          <span>Minimum due</span>
          <input
            inputMode="decimal"
            onChange={(event) => setDraft((current) => ({ ...current, minimumDue: event.target.value }))}
            placeholder="0"
            type="number"
            value={draft.minimumDue}
          />
        </label>
        <button className="primary-button big" onClick={saveCard} type="button">
          Add credit card
        </button>
      </div>

      <div className="account-grid">
        {cards.map((card) => {
          const outstanding = calculateCardOutstanding(card, entries);
          return (
            <article className="account-card glass-card" key={card.id}>
              <div>
                <span className="account-type">{card.bankName}</span>
                <h3>{card.cardName}</h3>
                <p className="empty-state">
                  {card.lastFour ? `Ending ${card.lastFour} · ` : ""}
                  Statement {card.statementDay} · Due {card.dueDay}
                </p>
              </div>
              <strong className={outstanding > 0 ? "negative" : ""}>
                {formatCurrency(outstanding)}
              </strong>
              <footer>
                <span>Limit {formatCurrency(card.creditLimit)}</span>
                <button
                  className="ghost-button small-button"
                  onClick={() => setCards((current) => current.filter((item) => item.id !== card.id))}
                  type="button"
                >
                  Remove
                </button>
              </footer>
            </article>
          );
        })}
        {cards.length === 0 ? (
          <p className="empty-state">Add your first credit card to start tracking dues.</p>
        ) : null}
      </div>
    </section>
  );
}
