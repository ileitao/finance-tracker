import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth";
import { Transaction } from "../types/transaction";
import { transactionSchema } from "../schemas/transaction.schema";
import prisma from "../lib/prisma";

export interface TransactionQueryParams {
  category?: string; // optional
  month?: string; // "YYYY-MM" format, optional
}

export async function transactionRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  // GET /transactions
  app.get("/transactions", async (request, reply) => {
    const { category, month } = request.query as TransactionQueryParams;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: request.user.userId,
        ...(category && { category }),
        ...(month && { date: { startsWith: month } }),
      },
    });

    return transactions;
  });

  // POST /transactions
  app.post<{ Body: Omit<Transaction, "id"> }>(
    "/transactions",
    async (request, reply) => {
      try {
        transactionSchema.parse(request.body);
      } catch (error: any) {
        return reply.status(400).send({ error: "Incorrect data format" });
      }

      const transaction = await prisma.transaction.create({
        data: {
          ...request.body,
          userId: request.user.userId,
        },
      });
      return reply.status(201).send(transaction);
    },
  );

  // GET /transactions/:id
  app.get<{ Params: { id: string } }>(
    "/transactions/:id",
    async (request, reply) => {
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: request.params.id,
          userId: request.user.userId,
        },
      });
      if (!transaction) {
        return reply.status(404).send({ error: "Transaction not found" });
      }
      return transaction;
    },
  );

  // PUT /transactions/:id
  app.put<{ Params: { id: string }; Body: Partial<Omit<Transaction, "id">> }>(
    "/transactions/:id",
    async (request, reply) => {
      const transaction = await prisma.transaction.update({
        where: {
          id: request.params.id,
          userId: request.user.userId,
        },
        data: request.body,
      });
      if (!transaction) {
        return reply.status(404).send({ error: "Transaction not found" });
      }
      return transaction;
    },
  );

  // DELETE /transactions/:id
  app.delete<{ Params: { id: string } }>(
    "/transactions/:id",
    async (request, reply) => {
      await prisma.transaction.delete({
        where: {
          id: request.params.id,
          userId: request.user.userId,
        },
      });
      return reply.status(204).send();
    },
  );
}
