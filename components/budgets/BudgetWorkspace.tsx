"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  budgetsStorageKey,
  getMonthKey,
  readLocalBudgets,
  readLocalQuickEntries,
  type LocalBudget,
} from "@/lib/local-finance";
import { categories } from "@/lib/sample-data";

export function BudgetWorkspace() {
  const [budgets, setBudgets] = useState<LocalBudget[]>(() => readLocalBudgets());
  const [month, setMonth] = useState(getMonthKey());
  const [draft, setDraft] = useState({ category: "Food", limit: "" });

  useEffect(() => {
    window.localStorage.setItem(budgetsStorageKey, JSON.stringify(budgets));
  }, [budgets]);

  const entries = readLocalQuickEntries();
  const monthBudgets = budgets.filter((budget) => budget.month === month);
  const spentByCategory = entries
    .filter((entry) => entry.type === "expense" && entry.transactionDate.startsWith(month))
    .reduce<Record<string, number>>((totals, entry) => {
      totals[entry.category] = (totals[entry.category] ?? 0) + entry.amount;
      return totals;
    }, {});

  function saveBudget() {
    const limit = Number(draft.limit);
    if (!draft.category || limit <= 0) {
      return;
    }

    setBudgets((current) => {
      const withoutDuplicate = current.filter(
        (budget) => !(budget.month === month && budget.category === draft.category),
      );
      return [
        {
          id: crypto.randomUUID(),
          category: draft.category,
          limit,
          month,
        },
        ...withoutDuplicate,
      ];
    });
    setDraft({ category: draft.category, limit: "" });
  }

  function copyLastMonth() {
    const date = new Date(`${month}-01T00:00:00`);
    date.setMonth(date.getMonth() - 1);
    const lastMonth = getMonthKey(date);
    const previous = budgets.filter((budget) => budget.month === lastMonth);
    setBudgets((current) => [
      ...previous.map((budget) => ({
        ...budget,
        id: crypto.randomUUID(),
        month,
      })),
      ...current.filter((budget) => budget.month !== month),
    ]);
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Budgets</p>
          <h2>Monthly category limits</h2>
          <p className="empty-state">
            Budgets are month-specific. Copy last month when you want a fast start.
          </p>
        </div>
        <div className="button-row">
          <input
            className="month-input"
            onChange={(event) => setMonth(event.target.value)}
            type="month"
            value={month}
          />
          <button className="ghost-button" onClick={copyLastMonth} type="button">
            Copy last month
          </button>
        </div>
      </div>

      <div className="budget-form">
        <label>
          <span>Category</span>
          <select
            onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            value={draft.category}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Limit</span>
          <input
            inputMode="decimal"
            onChange={(event) => setDraft((current) => ({ ...current, limit: event.target.value }))}
            placeholder="8000"
            type="number"
            value={draft.limit}
          />
        </label>
        <button className="primary-button big" onClick={saveBudget} type="button">
          Save budget
        </button>
      </div>

      <div className="budget-list">
        {monthBudgets.map((budget) => {
          const spent = spentByCategory[budget.category] ?? 0;
          const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
          const over = spent > budget.limit;
          return (
            <article className={over ? "budget-row over-budget" : "budget-row"} key={budget.id}>
              <div>
                <strong>{budget.category}</strong>
                <span>
                  {formatCurrency(spent)} of {formatCurrency(budget.limit)}
                </span>
              </div>
              <div className="budget-track">
                <span style={{ width: `${Math.min(percentage, 100)}%` }} />
              </div>
              <b>{percentage}%</b>
              <button
                className="ghost-button small-button"
                onClick={() => setBudgets((current) => current.filter((item) => item.id !== budget.id))}
                type="button"
              >
                Delete
              </button>
            </article>
          );
        })}
        {monthBudgets.length === 0 ? (
          <p className="empty-state">No budgets for this month yet.</p>
        ) : null}
      </div>
    </section>
  );
}
