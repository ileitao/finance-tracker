import Fastify from "fastify";

import { authRoutes } from "./routes/auth";
import { summaryRoutes } from "./routes/summary";
import { transactionRoutes } from "./routes/transactions";

const app = Fastify({
  logger: true,
});

app.register(authRoutes);
app.register(summaryRoutes);
app.register(transactionRoutes);

app.listen(
  {
    port: Number(process.env.PORT) || 3000,
    host: "0.0.0.0",
  },
  (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  },
);
