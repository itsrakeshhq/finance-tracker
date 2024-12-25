import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
