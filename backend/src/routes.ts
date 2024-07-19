import { publicProcedure, router } from "./trpc";

const appRouter = router({
  test: publicProcedure.query(() => {
    return "Hello, world!";
  }),
});

export default appRouter;
