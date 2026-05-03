import Fastify from "fastify";

import { transactionRoutes } from "./routes/transactions";
import { summaryRoutes } from "./routes/summary";

const app = Fastify({ 
  logger: true 
});

app.register(transactionRoutes);
app.register(summaryRoutes);

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});