"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Role } from "@/app/generated/prisma/client";
import { navItemsForRole } from "@/lib/nav-config";
import { BrandLogoWithLabel } from "@/components/brand/BrandLogo";

export function Sidebar({ serverRole }: { serverRole: Role }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role: Role = (session?.user?.role as Role | undefined) ?? serverRole;

  const visibleItems = navItemsForRole(role);

  return (
    <aside className="relative z-10 hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl lg:flex">
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5 transition-opacity hover:opacity-90"
      >
        <BrandLogoWithLabel tone="dark" />
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (!item.exact && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-teal-500/25 to-emerald-600/10 text-white shadow-sm ring-1 ring-teal-400/25"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100",
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", isActive ? "text-teal-300" : "text-zinc-500")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-center text-[11px] text-zinc-500">
          Signed in as{" "}
          <span className="font-semibold text-zinc-200">
            {role.charAt(0) + role.slice(1).toLowerCase()}
          </span>
        </div>
      </div>
    </aside>
  );
}
