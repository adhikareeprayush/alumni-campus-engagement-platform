import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MarketingBackdrop } from "@/components/shell/MarketingBackdrop";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="relative flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased">
      <MarketingBackdrop className="z-0" />
      <Sidebar serverRole={session.user.role} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header serverRole={session.user.role} />
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
