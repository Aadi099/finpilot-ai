export const accounts = [
  {
    id: "acc_hdfc_savings",
    name: "HDFC Salary Account",
    type: "Bank",
    kind: "bank",
    institution: "HDFC Bank",
    balance: 482500,
    updatedAt: "2026-08-01",
  },
  {
    id: "acc_axis_savings",
    name: "Axis Emergency Fund",
    type: "Bank",
    kind: "bank",
    institution: "Axis Bank",
    balance: 265000,
    updatedAt: "2026-08-01",
  },
  {
    id: "acc_sbi_joint",
    name: "SBI Joint Account",
    type: "Bank",
    kind: "bank",
    institution: "SBI",
    balance: 138400,
    updatedAt: "2026-07-31",
  },
  {
    id: "acc_cash",
    name: "Cash Wallet",
    type: "Cash",
    kind: "cash",
    institution: "Manual",
    balance: 18500,
    updatedAt: "2026-08-01",
  },
  {
    id: "acc_icici_card",
    name: "ICICI Credit Card",
    type: "Credit Card",
    kind: "credit_card",
    institution: "ICICI Bank",
    balance: -74200,
    updatedAt: "2026-07-31",
  },
  {
    id: "acc_zerodha",
    name: "Zerodha Brokerage",
    type: "Brokerage",
    kind: "brokerage",
    institution: "Zerodha",
    balance: 2240000,
    updatedAt: "2026-08-01",
  },
  {
    id: "acc_epf",
    name: "EPF",
    type: "Provident Fund",
    kind: "provident_fund",
    institution: "EPFO",
    balance: 1185000,
    updatedAt: "2026-07-30",
  },
  {
    id: "acc_home_loan",
    name: "Home Loan",
    type: "Loan",
    kind: "loan",
    institution: "SBI",
    balance: -4260000,
    updatedAt: "2026-08-01",
  },
];

export const transactions = [
  {
    id: "txn_salary_aug",
    merchant: "Salary",
    category: "Income",
    account: "HDFC Salary Account",
    type: "income",
    amount: 210000,
    date: "2026-08-01",
    paidDate: "2026-08-01",
    paymentMethod: "Bank Transfer",
    source: "Employer",
  },
  {
    id: "txn_sip",
    merchant: "Index Fund SIP",
    category: "Investments",
    account: "HDFC Salary Account",
    type: "transfer",
    amount: -60000,
    date: "2026-08-01",
    paidDate: "2026-08-01",
    paymentMethod: "Bank Transfer",
    source: "Self",
  },
  {
    id: "txn_rent",
    merchant: "Rent",
    category: "Housing",
    account: "HDFC Salary Account",
    type: "expense",
    amount: -42000,
    date: "2026-07-30",
    paidDate: "2026-07-30",
    paymentMethod: "UPI",
    source: "Landlord",
  },
  {
    id: "txn_groceries",
    merchant: "BigBasket",
    category: "Groceries",
    account: "ICICI Credit Card",
    type: "expense",
    amount: -6850,
    date: "2026-07-29",
    paidDate: "2026-08-05",
    paymentMethod: "Credit Card",
    source: "BigBasket",
  },
  {
    id: "txn_dividend",
    merchant: "Stock Dividend",
    category: "Investment Income",
    account: "Zerodha Brokerage",
    type: "income",
    amount: 8400,
    date: "2026-07-28",
    paidDate: "2026-07-28",
    paymentMethod: "Brokerage Credit",
    source: "Zerodha",
  },
  {
    id: "txn_dining",
    merchant: "Swiggy",
    category: "Dining",
    account: "ICICI Credit Card",
    type: "expense",
    amount: -1900,
    date: "2026-07-27",
    paidDate: "2026-08-05",
    paymentMethod: "Credit Card",
    source: "Swiggy",
  },
  {
    id: "txn_fuel",
    merchant: "Shell",
    category: "Transport",
    account: "ICICI Credit Card",
    type: "expense",
    amount: -3200,
    date: "2026-07-26",
    paidDate: "2026-08-05",
    paymentMethod: "Credit Card",
    source: "Shell",
  },
];

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
    month: "2026-08",
    salaryExpected: 210000,
    investmentValueOpening: 3500000,
    cashOpening: 501000,
    creditCardDueOpening: 74200,
  },
];

export const investments = [
  { name: "Indian Stocks", provider: "Zerodha", investedAmount: 1220000, currentValue: 1485000 },
  { name: "Mutual Funds", provider: "Groww", investedAmount: 980000, currentValue: 1210000 },
  { name: "US ETFs", provider: "Vested", investedAmount: 420000, currentValue: 502000 },
  { name: "Gold", provider: "Sovereign Gold Bond", investedAmount: 180000, currentValue: 225000 },
  { name: "Crypto", provider: "CoinDCX", investedAmount: 90000, currentValue: 78000 },
];

export const assetAllocation = [
  { name: "Stocks", weight: 42, color: "#2563eb" },
  { name: "Mutual funds", weight: 34, color: "#059669" },
  { name: "Gold", weight: 9, color: "#d97706" },
  { name: "EPF/PPF/NPS", weight: 11, color: "#7c3aed" },
  { name: "Crypto", weight: 4, color: "#db2777" },
];

export const goals = [
  { name: "Emergency fund", current: 740000, target: 1000000 },
  { name: "Home down payment", current: 1560000, target: 3000000 },
  { name: "Retirement corpus", current: 3820000, target: 50000000 },
];

export const bills = [
  { name: "Credit card payment", dueDate: "2026-08-05", amount: 74200, status: "upcoming" },
  { name: "Internet", dueDate: "2026-08-07", amount: 1499, status: "upcoming" },
  { name: "Health insurance", dueDate: "2026-08-12", amount: 24000, status: "upcoming" },
  { name: "Electricity", dueDate: "2026-07-28", amount: 3900, status: "paid" },
];

export const budgetSnapshot = [
  { category: "Housing", spent: 42000, limit: 45000 },
  { category: "Food", spent: 8750, limit: 18000 },
  { category: "Transport", spent: 3200, limit: 10000 },
  { category: "Lifestyle", spent: 12500, limit: 25000 },
];

export const netWorthTrend = [
  { month: "Mar", index: 62 },
  { month: "Apr", index: 68 },
  { month: "May", index: 71 },
  { month: "Jun", index: 77 },
  { month: "Jul", index: 84 },
  { month: "Aug", index: 91 },
];
