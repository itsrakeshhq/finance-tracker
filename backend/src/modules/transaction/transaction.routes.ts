import { publicProcedure, router } from "../../trpc";
import TransactionController from "./transaction.controller";
import { insertUserSchema } from "./transaction.schema";

const transactionRouter = router({
  create: publicProcedure
    .input(insertUserSchema)
    .mutation(({ input }) =>
      new TransactionController().createTransactionHandler(input)
    ),

  getAll: publicProcedure.query(() =>
    new TransactionController().getTransactionsHandler()
  ),
});

export default transactionRouter;
