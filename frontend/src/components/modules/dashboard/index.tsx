"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  PlusIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  amount: z.coerce.number().positive(),
  txnType: z.enum(["Incoming", "Outgoing"]),
  summary: z.string().optional(),
  tag: z
    .enum([
      "Food",
      "Travel",
      "Shopping",
      "Investment",
      "Salary",
      "Bill",
      "Others",
    ])
    .optional(),
});

export default function Dashboard() {
  const { data: transactions } = trpc.transaction.getAll.useQuery();

  const totalBalance = transactions?.reduce(
    (acc, transaction) =>
      transaction.txnType === "Incoming"
        ? acc + transaction.amount
        : acc - transaction.amount,
    0
  );

  const totalIncome = transactions
    ?.filter((transaction) => transaction.txnType === "Incoming")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const totalExpenses = transactions
    ?.filter((transaction) => transaction.txnType === "Outgoing")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      txnType: "Outgoing",
      summary: "",
      tag: undefined,
    },
  });

  const utils = trpc.useUtils();

  const { mutateAsync: createTxn, isLoading: isCreating } =
    trpc.transaction.create.useMutation({
      onSuccess: async () => {
        form.reset();
        await utils.transaction.getAll.invalidate();
      },
    });

  const addTransaction = async (data: z.infer<typeof formSchema>) => {
    try {
      await createTxn(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Finance Tracker</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalBalance?.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${totalIncome?.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                ${totalExpenses?.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {transactions?.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <span>{transaction.tag}</span>
                    <span
                      className={
                        transaction.txnType === "Incoming"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {transaction.txnType === "Incoming" ? "+" : "-"}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(addTransaction)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="txnType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Incoming">Income</SelectItem>
                            <SelectItem value="Outgoing">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="Food">Food</SelectItem>
                              <SelectItem value="Travel">Travel</SelectItem>
                              <SelectItem value="Shopping">Shopping</SelectItem>
                              <SelectItem value="Investment">
                                Investment
                              </SelectItem>
                              <SelectItem value="Salary">Salary</SelectItem>
                              <SelectItem value="Bill">Bill</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCreating}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" /> Add Transaction
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
