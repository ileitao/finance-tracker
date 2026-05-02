export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
}

export interface Summary {
  totalIncome: number,
  totalExpenses: number,
  balance: number
  byCategory: Record<string, number>;
}

export interface SummaryQueryParams {
  month?: string;  // "YYYY-MM" format, optional
}

export interface TransactionQueryParams {
  category?: string;  // optional
  month?: string;     // "YYYY-MM" format, optional
}
