import authRouter from "./modules/auth/auth.routes";
import transactionRouter from "./modules/transaction/transaction.routes";
import { router } from "./trpc";

const appRouter = router({
  transaction: transactionRouter,
  auth: authRouter,
});

export default appRouter;
