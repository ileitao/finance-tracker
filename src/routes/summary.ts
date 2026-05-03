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

    const transactions = await prisma.transaction.findMany({
      where: {
        ...(month && { date: { startsWith: month } }),
      },
    });

    let categories = [...new Set(transactions.map(t => t.category))];

    result.totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, current) => acc + current.amount, 0);
    result.totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, current) => acc + current.amount, 0);
    result.balance = result.totalIncome - result.totalExpenses;
    categories
      .forEach(
        value => result.byCategory[value] = transactions
            .filter(t => t.category === value)
            .reduce((acc, current) => acc + current.amount, 0));

    return result;
  });
}