import { initTRPC, type inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import SuperJSON from "superjson";

/**
 * Creates the context for tRPC by extracting the request and response objects from the Express context options.
 */
export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions) => ({});
export type Context = inferAsyncReturnType<typeof createContext>;

/**
 * The tRPC instance used for handling server-side requests.
 */
const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

/**
 * The router object for tRPC.
 */
export const router = t.router;
/**
 * Exported constant representing a tRPC public procedure.
 */
export const publicProcedure = t.procedure;
