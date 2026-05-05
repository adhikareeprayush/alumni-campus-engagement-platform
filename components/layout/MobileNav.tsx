"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { navItemsForRole } from "@/lib/nav-config";
import type { Role } from "@/app/generated/prisma/client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BRAND } from "@/lib/brand";

export function MobileNav({ serverRole }: { serverRole: Role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navItemsForRole(serverRole);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden -ml-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] flex-col border-r border-white/[0.08] bg-zinc-950/95 p-0 shadow-2xl shadow-black/50 outline-none backdrop-blur-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandLogo size={36} className="rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10" />
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{BRAND.siteName}</span>
                <span className="block truncate text-[10px] font-medium text-teal-400/90">{BRAND.institutionShort}</span>
              </div>
            </div>
            <DialogPrimitive.Close className="rounded-md p-2 text-zinc-500 hover:bg-white/[0.06] hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (!item.exact && pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-teal-500/25 to-emerald-600/10 text-white ring-1 ring-teal-400/25"
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
          <div className="border-t border-white/[0.06] p-3">
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-center text-[11px] text-zinc-500">
              Signed in as{" "}
              <span className="font-semibold text-zinc-200">
                {serverRole.charAt(0) + serverRole.slice(1).toLowerCase()}
              </span>
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
