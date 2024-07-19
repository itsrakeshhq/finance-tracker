import { TRPCProvider } from "./trpc";

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
