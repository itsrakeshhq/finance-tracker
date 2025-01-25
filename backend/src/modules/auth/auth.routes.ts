import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { insertUserSchema } from "../user/user.schema";
import AuthController from "./auth.controller";

const authRouter = router({
  login: publicProcedure
    .input(insertUserSchema)
    .mutation(({ input, ctx }) =>
      new AuthController().loginHandler(input, ctx)
    ),

  register: publicProcedure
    .input(insertUserSchema)
    .mutation(({ input }) => new AuthController().registerHandler(input)),

  refreshAccessToken: publicProcedure.mutation(({ ctx }) =>
    new AuthController().refreshAccessTokenHandler(ctx)
  ),

  logout: protectedProcedure.mutation(({ ctx }) =>
    new AuthController().logoutHandler(ctx)
  ),

  logoutAll: protectedProcedure.mutation(({ ctx }) =>
    new AuthController().logoutAllHandler(ctx)
  ),
});

export default authRouter;
