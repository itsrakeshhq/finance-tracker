import { AuthenticatedContext } from "../../trpc";
import { transactions } from "./transaction.schema";
import TransactionService from "./transaction.service";

export default class TransactionController extends TransactionService {
  async createTransactionHandler(
    data: Omit<typeof transactions.$inferInsert, "userId">,
    ctx: AuthenticatedContext
  ) {
    return await super.createTransaction({
      ...data,
      userId: ctx.user.id,
    });
  }

  async getTransactionsHandler(ctx: AuthenticatedContext) {
    return await super.getTransactions(ctx.user.id);
  }
}
