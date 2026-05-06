import Fastify from 'fastify';
import cors from '@fastify/cors';
import { transactionRoutes } from './routes/transactions';
import { summaryRoutes } from './routes/summary';
import { authRoutes } from './routes/auth';

const app = Fastify({ logger: true });

app.register(cors, {
  origin: true, // allows all origins in development
  credentials: true,
});

app.register(authRoutes);
app.register(transactionRoutes);
app.register(summaryRoutes);

app.listen(
  {
    port: Number(process.env.PORT) || 3000,
    host: '0.0.0.0',
  },
  (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  },
);
