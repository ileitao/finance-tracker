export interface Summary {
  totalIncome: number,
  totalExpenses: number,
  balance: number
  byCategory: Record<string, number>;
}