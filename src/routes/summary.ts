import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth";
import { Summary } from "../types/summary";
import prisma from "../lib/prisma";

export interface SummaryQueryParams {
  month?: string; // "YYYY-MM" format, optional
}

export async function summaryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/summary", async (request, reply) => {
    const { month } = request.query as SummaryQueryParams;

    let result: Summary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      byCategory: {},
    };

    // DB queries
    const whereClause = {
      userId: request.user.userId,
      ...(month && { date: { startsWith: month } }),
    };

    const totalIncome = await prisma.transaction.aggregate({
      where: { ...whereClause, type: "income" },
      _sum: { amount: true },
    });
    const totalExpenses = await prisma.transaction.aggregate({
      where: { ...whereClause, type: "expense" },
      _sum: { amount: true },
    });
    const byCategory = await prisma.transaction.groupBy({
      by: ["category"],
      where: whereClause,
      _sum: { amount: true },
    });

    // Build response
    result.totalExpenses = totalExpenses._sum.amount ?? 0;
    result.totalIncome = totalIncome._sum.amount ?? 0;
    result.balance = result.totalIncome - result.totalExpenses;
    result.byCategory = byCategory.reduce<Record<string, number>>(
      (prev, curr) => {
        prev[curr.category] = curr._sum.amount ?? 0;
        return prev;
      },
      {},
    );
    return result;
  });
}
