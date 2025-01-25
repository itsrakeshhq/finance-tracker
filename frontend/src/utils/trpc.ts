import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink,
  HTTPHeaders,
  loggerLink,
} from "@trpc/react-query";
import superjson from "superjson";
import { AppRouter } from "../../../backend/src/index";

export const trpc = createTRPCReact<AppRouter>();

export const createTRPCServerClient = (headers: HTTPHeaders) =>
  createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      loggerLink({
        enabled: () => process.env.NODE_ENV === "development",
      }),
      httpBatchLink({
        url: process.env.NEXT_PUBLIC_TRPC_API_URL!,
        headers() {
          return headers;
        },
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
