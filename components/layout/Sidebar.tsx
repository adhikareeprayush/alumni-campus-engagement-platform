"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  UserCircle,
  ShieldCheck,
  GraduationCap,
  Megaphone,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/app/generated/prisma/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  exact?: boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ALUMNI", "STUDENT", "ADMIN", "FACULTY"],
  },
  {
    label: "Alumni Directory",
    href: "/alumni",
    icon: Users,
    roles: ["ALUMNI", "STUDENT", "ADMIN", "FACULTY"],
  },
  {
    label: "Jobs & Internships",
    href: "/jobs",
    icon: Briefcase,
    roles: ["ALUMNI", "STUDENT", "ADMIN", "FACULTY"],
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
    roles: ["ALUMNI", "STUDENT", "ADMIN", "FACULTY"],
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: UserCircle,
    roles: ["ALUMNI", "STUDENT", "ADMIN", "FACULTY"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "FACULTY"],
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    roles: ["ADMIN", "FACULTY"],
  },
  {
    label: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["ADMIN", "FACULTY"],
    exact: true, // sub-paths have their own nav items; don't stay active for /admin/*
  },
  {
    label: "Faculty access",
    href: "/admin/faculty-programs",
    icon: UserCog,
    roles: ["ADMIN"],
  },
];

export function Sidebar({ serverRole }: { serverRole: Role }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Client session is often undefined on first paint while useSession() loads; use server role until then
  const role: Role = (session?.user?.role as Role | undefined) ?? serverRole;

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">Alumni Portal</div>
          <div className="text-xs text-gray-400">IOE Purwanchal Campus</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (!item.exact && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600" : "text-gray-400")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="border-t p-4">
        <div className="rounded-md bg-gray-50 px-3 py-2 text-center text-xs text-gray-400">
          Signed in as{" "}
          <span className="font-semibold text-gray-600">{role.charAt(0) + role.slice(1).toLowerCase()}</span>
        </div>
      </div>
    </aside>
  );
}
