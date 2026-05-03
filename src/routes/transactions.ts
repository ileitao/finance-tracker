import { FastifyInstance } from "fastify";
import { Transaction } from "../types/transaction";
import prisma from "../lib/prisma";

export interface TransactionQueryParams {
  category?: string;  // optional
  month?: string;     // "YYYY-MM" format, optional
}

export async function transactionRoutes(app: FastifyInstance) {

  // GET /transactions
  app.get("/transactions", async (request, reply) => {
    const { category, month } = request.query as TransactionQueryParams;

    const transactions = await prisma.transaction.findMany({
      where: {
        ...(category && { category }),
        ...(month && { date: { startsWith: month } }),
      },
    });

    return transactions;
  });

  // POST /transactions
  app.post<{ Body: Omit<Transaction, "id"> }>("/transactions", async (request, reply) => {
    const transaction = await prisma.transaction.create({
      data: request.body,
    });
    return reply.status(201).send(transaction);
  });

  // GET /transactions/:id
  app.get<{ Params: { id: string } }>("/transactions/:id", async (request, reply) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: request.params.id },
    });
    if (!transaction) {
      return reply.status(404).send({ error: "Transaction not found" });
    }
    return transaction;
  });

  // PUT /transactions/:id
  app.put<{ Params: { id: string }; Body: Partial<Omit<Transaction, "id">> }>(
    "/transactions/:id",
    async (request, reply) => {
      const transaction = await prisma.transaction.update({
        where: { id: request.params.id },
        data: request.body,
      });
      if (!transaction) {
        return reply.status(404).send({ error: "Transaction not found" });
      }
      return transaction;
    }
  );

  // DELETE /transactions/:id
  app.delete<{ Params: { id: string } }>("/transactions/:id", async (request, reply) => {
    await prisma.transaction.delete({
      where: { id: request.params.id },
    });
    return reply.status(204).send();
  });
}