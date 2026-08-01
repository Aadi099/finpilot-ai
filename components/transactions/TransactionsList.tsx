"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { readLocalQuickEntries, type LocalQuickEntry } from "@/lib/local-finance";
import {
  getSupabaseBrowserClient,
  getSupabaseUser,
  type DbTransaction,
} from "@/lib/supabase-client";

export function TransactionsList() {
  const [entries, setEntries] = useState<LocalQuickEntry[]>([]);

  useEffect(() => {
    async function loadEntries() {
      const supabase = getSupabaseBrowserClient();
      const user = await getSupabaseUser();

      if (supabase && user) {
        const { data } = await supabase
          .from("transactions")
          .select("*")
          .order("transaction_date", { ascending: false });

        setEntries(
          ((data ?? []) as DbTransaction[]).map((transaction) => ({
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

      setEntries(readLocalQuickEntries());
    }

    loadEntries();
  }, []);

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
          <span className={`status ${transaction.type}`}>{transaction.type}</span>
        </article>
      ))}
    </>
  );
}
