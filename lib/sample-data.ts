export const accounts: Array<{
  id: string;
  name: string;
  type: string;
  kind: string;
  institution: string;
  balance: number;
  updatedAt: string;
}> = [];

export const transactions: Array<{
  id: string;
  merchant: string;
  category: string;
  account: string;
  type: string;
  amount: number;
  date: string;
  paidDate: string;
  paymentMethod: string;
  source: string;
}> = [];

export const categories = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Bills",
  "Rent",
  "Health",
  "Travel",
  "Investment",
  "Income",
  "Money Received",
  "Transfer",
  "Other",
];

export const paymentMethods = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Cash",
  "Bank Transfer",
  "Auto Debit",
  "Brokerage Credit",
];

export const monthlySnapshots = [
  {
    month: "Start here",
    salaryExpected: 0,
    investmentValueOpening: 0,
    cashOpening: 0,
    creditCardDueOpening: 0,
  },
];

export const investments: Array<{
  name: string;
  provider: string;
  investedAmount: number;
  currentValue: number;
}> = [];

export const assetAllocation: Array<{
  name: string;
  weight: number;
  color: string;
}> = [];

export const goals: Array<{
  name: string;
  current: number;
  target: number;
}> = [];

export const bills: Array<{
  name: string;
  dueDate: string;
  amount: number;
  status: string;
}> = [];

export const budgetSnapshot: Array<{
  category: string;
  spent: number;
  limit: number;
}> = [];

export const netWorthTrend: Array<{
  month: string;
  index: number;
}> = [];
