import { cn } from "@/lib/utils";

/** Shared mesh + grid used on marketing, auth, and signed-in app shell for visual continuity. */
export function MarketingBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 55% at 8% 18%, rgba(45, 212, 191, 0.35), transparent 52%),
            radial-gradient(ellipse 55% 45% at 92% 12%, rgba(251, 191, 36, 0.18), transparent 46%),
            radial-gradient(ellipse 45% 38% at 48% 92%, rgba(16, 185, 129, 0.22), transparent 48%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
    </div>
  );
}
