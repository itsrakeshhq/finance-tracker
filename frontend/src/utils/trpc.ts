import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../../../backend/src/index";

export const trpc = createTRPCReact<AppRouter>();
