export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
