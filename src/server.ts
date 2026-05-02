import Fastify from "fastify";

import { transactionRoutes } from "./routes/transactions";

const app = Fastify({ 
  logger: true 
});

app.register(transactionRoutes);

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});