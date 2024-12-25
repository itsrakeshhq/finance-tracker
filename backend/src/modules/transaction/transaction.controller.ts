import { transactions } from "./transaction.schema";
import TransactionService from "./transaction.service";

export default class TransactionController extends TransactionService {
  async createTransactionHandler(data: typeof transactions.$inferInsert) {
    return await super.createTransaction(data);
  }

  async getTransactionsHandler() {
    return await super.getTransactions();
  }
}
