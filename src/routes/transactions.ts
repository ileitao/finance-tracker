import { FastifyInstance } from "fastify";
import { 
  Transaction,
  Summary,
  type TransactionQueryParams,
  type SummaryQueryParams 
} from "../types/transaction";
import { randomUUID } from "crypto";

// let transactions: Transaction[] = [];
let transactions: Transaction[] = [
  { id: "1", amount: 1500, type: "income",  category: "salary",    description: "Monthly salary",   date: "2026-05-01" },
  { id: "2", amount: 120,  type: "expense", category: "food",      description: "Groceries",        date: "2026-05-03" },
  { id: "3", amount: 80,   type: "expense", category: "transport", description: "Bus pass",         date: "2026-05-10" },
  { id: "4", amount: 200,  type: "expense", category: "food",      description: "Restaurant",       date: "2026-05-15" },
  { id: "5", amount: 500,  type: "income",  category: "freelance", description: "Side project",     date: "2026-04-20" },
  { id: "6", amount: 60,   type: "expense", category: "transport", description: "Uber",             date: "2026-04-22" },
];

export async function transactionRoutes(app: FastifyInstance) {
  // GET /transactions
  app.get("/transactions", async (request, reply) => {
    const { category, month } = request.query as TransactionQueryParams;

    let result = transactions;

    if (category) result = result.filter(t => t.category === category);
    if (month) result = result.filter(t => t.date.startsWith(month));

    return result;
  });

  // POST /transactions
  app.post<{ Body: Omit<Transaction, "id"> }>("/transactions", async (request, reply) => {
    const transaction: Transaction = {
      id: randomUUID(),
      ...request.body,
    };
    transactions.push(transaction);
    return reply.status(201).send(transaction);
  });

  // GET /transactions/:id
  app.get<{ Params: { id: string } }>("/transactions/:id", async (request, reply) => {
    const transaction = transactions.find(t => t.id === request.params.id);
    if (!transaction) {
      return reply.status(404).send({ error: "Transaction not found" });
    }
    return transaction;
  });

  // PUT /transactions/:id
  app.put<{ Params: { id: string }; Body: Partial<Omit<Transaction, "id">> }>(
    "/transactions/:id",
    async (request, reply) => {
      const index = transactions.findIndex(t => t.id === request.params.id);
      if (index === -1) {
        return reply.status(404).send({ error: "Transaction not found" });
      }
      transactions[index] = { ...transactions[index], ...request.body };
      return transactions[index];
    }
  );

  // DELETE /transactions/:id
  app.delete<{ Params: { id: string } }>("/transactions/:id", async (request, reply) => {
    const index = transactions.findIndex(t => t.id === request.params.id);
    if (index === -1) {
      return reply.status(404).send({ error: "Transaction not found" });
    }
    transactions.splice(index, 1);
    return reply.status(204).send();
  });

  app.get("/summary", async (request, reply) => {
    const { month } = request.query as SummaryQueryParams;

    let result: Summary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      byCategory: {}
    }
    let filteredTransactions = transactions;
    if (month) filteredTransactions = transactions.filter(t => t.date.startsWith(month));
    let categories = [...new Set(filteredTransactions.map(t => t.category))];

    result.totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, current) => acc + current.amount, 0);
    result.totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, current) => acc + current.amount, 0);
    result.balance = result.totalIncome - result.totalExpenses;
    categories
      .forEach(
        value => result.byCategory[value] = filteredTransactions
            .filter(t => t.category === value)
            .reduce((acc, current) => acc + current.amount, 0));

    return result;
  });
}