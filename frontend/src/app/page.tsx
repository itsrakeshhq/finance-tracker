"use client";

import { trpc } from "@/utils/trpc";

export default function Home() {
  const { data } = trpc.test.useQuery();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {data}
    </main>
  );
}
