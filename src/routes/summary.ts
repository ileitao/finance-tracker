import { FastifyInstance } from "fastify";
import { Summary } from "../types/summary";
import prisma from "../lib/prisma";

export interface SummaryQueryParams {
  month?: string;  // "YYYY-MM" format, optional
}

export async function summaryRoutes(app: FastifyInstance) {
  app.get("/summary", async (request, reply) => {
    const { month } = request.query as SummaryQueryParams;

    let result: Summary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      byCategory: {}
    }

     const whereClause = {
      ...(month && { date: { startsWith: month } }),
    };

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
    });

    let categories = [...new Set(transactions.map(t => t.category))];

    const totalIncome = await prisma.transaction.aggregate({
        where: { ...whereClause, type: 'income' },
        _sum: { amount: true },
    });
    const totalExpenses = await prisma.transaction.aggregate({
        where: { ...whereClause, type: 'expense' },
        _sum: { amount: true },
    });
    categories
      .forEach(
        value => result.byCategory[value] = transactions
            .filter(t => t.category === value)
            .reduce((acc, current) => acc + current.amount, 0));

    result.totalExpenses = totalExpenses._sum.amount ?? 0;
    result.totalIncome = totalIncome._sum.amount ?? 0;
    result.balance = result.totalIncome - result.totalExpenses;
    return result;
  });
}