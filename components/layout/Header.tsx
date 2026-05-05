"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { LogOut, Settings, User } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";
import type { Role } from "@/app/generated/prisma/client";

const roleBadgeClass: Record<string, string> = {
  ADMIN: "border-0 bg-gradient-to-r from-teal-500 to-emerald-600 text-white",
  FACULTY: "border-teal-400/30 bg-teal-500/15 text-teal-100",
  ALUMNI: "border-white/15 bg-white/[0.06] text-zinc-200",
  STUDENT: "border-white/15 bg-white/[0.06] text-zinc-200",
};

interface HeaderProps {
  serverRole: Role;
}

export function Header({ serverRole }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-zinc-950/75 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/65 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-1">
        <MobileNav serverRole={serverRole} />
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex max-w-[min(100%,14rem)] items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40 sm:max-w-none sm:gap-3"
          >
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {user?.role && (
                <Badge
                  variant="outline"
                  className={`hidden text-[10px] uppercase tracking-wide sm:inline-flex ${roleBadgeClass[user.role] ?? "border-white/15 text-zinc-200"}`}
                >
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </Badge>
              )}
              <Avatar className="h-9 w-9 ring-2 ring-white/10 shadow-md shadow-black/30">
                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-gradient-to-br from-teal-600 to-emerald-700 text-xs font-semibold text-white">
                  {user?.name ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[200px] rounded-xl border border-white/[0.08] bg-zinc-900/95 p-1 shadow-xl shadow-black/50 backdrop-blur-xl"
          >
            <DropdownMenu.Item asChild>
              <Link
                href="/profile"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.06] focus:outline-none"
              >
                <User className="h-4 w-4 text-zinc-500" />
                My Profile
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                href="/profile/settings"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.06] focus:outline-none"
              >
                <Settings className="h-4 w-4 text-zinc-500" />
                Settings
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-white/[0.08]" />
            <DropdownMenu.Item asChild>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 focus:outline-none"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
