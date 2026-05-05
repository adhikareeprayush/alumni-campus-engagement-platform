import type { Role } from "@/app/generated/prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  UserCircle,
  ShieldCheck,
  Megaphone,
  UserCog,
  ClipboardList,
} from "lucide-react";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  /** When true, only exact path matches for active state (not child routes). */
  exact?: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
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
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone,
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
    label: "Manage announcements",
    href: "/admin/announcements",
    icon: ClipboardList,
    roles: ["ADMIN", "FACULTY"],
  },
  {
    label: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["ADMIN", "FACULTY"],
    exact: true,
  },
  {
    label: "Faculty access",
    href: "/admin/faculty-programs",
    icon: UserCog,
    roles: ["ADMIN"],
  },
];

export function navItemsForRole(role: Role): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.roles.includes(role));
}
