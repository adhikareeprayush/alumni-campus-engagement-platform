"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { LogOut, Settings, User, Menu } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  FACULTY: "secondary",
  ALUMNI: "outline",
  STUDENT: "outline",
};

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button placeholder */}
        <button className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu className="h-5 w-5" />
        </button>
        {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 focus:outline-none">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {user?.role && (
                <Badge
                  variant={roleBadgeVariant[user.role] ?? "outline"}
                  className="hidden text-xs sm:flex"
                >
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </Badge>
              )}
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
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
            className="z-50 min-w-[180px] rounded-lg border bg-white p-1 shadow-lg"
          >
            <DropdownMenu.Item asChild>
              <Link
                href="/profile"
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <User className="h-4 w-4 text-gray-400" />
                My Profile
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link
                href="/profile/settings"
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Settings
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none"
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
