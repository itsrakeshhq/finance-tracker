import { protectedProcedure, router } from "../../trpc";
import TransactionController from "./transaction.controller";
import { insertTransactionSchema } from "./transaction.schema";

const transactionRouter = router({
  create: protectedProcedure
    .input(insertTransactionSchema)
    .mutation(({ input, ctx }) =>
      new TransactionController().createTransactionHandler(input, ctx)
    ),

  getAll: protectedProcedure.query(({ ctx }) =>
    new TransactionController().getTransactionsHandler(ctx)
  ),
});

export default transactionRouter;
