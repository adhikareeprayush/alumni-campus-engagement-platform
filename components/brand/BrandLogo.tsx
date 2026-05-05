import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

type Props = {
  className?: string;
  /** CSS pixel size (width & height) */
  size?: number;
};

/** Brand mark — same asset as the site favicon (`public/brand/summitlink-mark.svg`). */
export function BrandLogo({ className, size = 40 }: Props) {
  return (
    <img
      src="/brand/summitlink-mark.svg"
      alt={`${BRAND.siteName} logo`}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-lg object-contain", className)}
    />
  );
}

export function BrandLogoWithLabel({
  className,
  subtitle,
  tone = "dark",
}: {
  className?: string;
  subtitle?: string;
  /** `dark` matches marketing / app shell (zinc + teal). `light` for light backgrounds. */
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <BrandLogo size={40} className="rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10" />
      <div className="min-w-0 text-left">
        <span
          className={cn(
            "block truncate font-semibold tracking-tight",
            tone === "dark" ? "text-white" : "text-slate-900",
          )}
        >
          {BRAND.siteName}
        </span>
        <span
          className={cn(
            "block truncate text-xs font-medium",
            tone === "dark" ? "text-teal-400/90" : "text-slate-500",
          )}
        >
          {subtitle ?? BRAND.institutionShort}
        </span>
      </div>
    </div>
  );
}
