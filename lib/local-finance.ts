export type LocalBankAccount = {
  id: string;
  bankName: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  currentBalance?: number;
};

export type LocalQuickEntry = {
  id: string;
  type: "expense" | "income" | "transfer";
  amount: number;
  name: string;
  category: string;
  transactionDate: string;
  paidDate: string;
  paymentMethod: string;
  account: string;
  note: string;
};

export const bankAccountsStorageKey = "finpilot.bankAccounts";
export const quickEntriesStorageKey = "finpilot.quickEntries";

export function readLocalBankAccounts(): LocalBankAccount[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(bankAccountsStorageKey);
  return stored ? JSON.parse(stored) : [];
}

export function readLocalQuickEntries(): LocalQuickEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(quickEntriesStorageKey);
  return stored ? JSON.parse(stored) : [];
}

export function transactionImpact(entry: LocalQuickEntry) {
  if (entry.type === "income") {
    return entry.amount;
  }

  return -entry.amount;
}

export function calculateAccountBalance(
  account: LocalBankAccount,
  entries: LocalQuickEntry[],
) {
  const startingBalance = account.openingBalance ?? account.currentBalance ?? 0;
  const movement = entries
    .filter((entry) => entry.account === account.accountName)
    .reduce((total, entry) => total + transactionImpact(entry), 0);

  return startingBalance + movement;
}
