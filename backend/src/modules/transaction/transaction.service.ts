import { TRPCError } from "@trpc/server";
import { desc } from "drizzle-orm";
import { db } from "../../utils/db";
import { transactions } from "./transaction.schema";

export default class TransactionService {
  async createTransaction(data: typeof transactions.$inferInsert) {
    try {
      return await db.insert(transactions).values(data).returning();
    } catch (error) {
      console.log(error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create transaction",
      });
    }
  }

  async getTransactions() {
    try {
      return await db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.createdAt));
    } catch (error) {
      console.log(error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch transactions",
      });
    }
  }
}
