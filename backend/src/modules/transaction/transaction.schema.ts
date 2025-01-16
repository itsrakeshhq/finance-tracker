import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "../user/user.schema";

export const txnTypeEnum = pgEnum("txnType", ["Incoming", "Outgoing"]);
export const tagEnum = pgEnum("tag", [
  "Food",
  "Travel",
  "Shopping",
  "Investment",
  "Salary",
  "Bill",
  "Others",
]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  txnType: txnTypeEnum("txn_type").notNull(),
  summary: text("summary"),
  tag: tagEnum("tag").default("Others"),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});
