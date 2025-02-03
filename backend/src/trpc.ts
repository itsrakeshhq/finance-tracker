import { initTRPC, TRPCError, type inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import Cookies from "cookies";
import { eq } from "drizzle-orm";
import SuperJSON from "superjson";
import AuthService from "./modules/auth/auth.service";
import { users } from "./modules/user/user.schema";
import { db } from "./utils/db";
import { redis } from "./utils/redis";

/**
 * Creates the context for tRPC by extracting the request and response objects from the Express context options.
 */
export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  try {
    const cookies = new Cookies(req, res);
    const accessToken = cookies.get("accessToken");
    if (!accessToken) {
      return { req, res };
    }

    const userId = new AuthService().verifyAccessToken(accessToken);
    if (!userId) {
      return { req, res };
    }

    // Check if user has active session
    const session = await redis.get(`user:${userId}`);
    if (!session) {
      return { req, res };
    }

    // Check if user still exists
    const user = (
      await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1)
    )[0];
    if (!user) {
      return { req, res };
    }

    return {
      req,
      res,
      user,
    };
  } catch (error) {
    console.log(error);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};
export type Context = inferAsyncReturnType<typeof createContext>;
export type AuthenticatedContext = Context & {
  user: NonNullable<Context["user"]>;
};

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

// Middleware to check if user is authenticated
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Using the middleware, create a protected procedure
export const protectedProcedure = publicProcedure.use(isAuthenticated);
