/**
 * Shared Tailwind classes for protected app routes (dark zinc shell + teal accent).
 * Import from `@/lib/app-ui` in pages and components for consistent surfaces.
 */
export const appPanel =
  "rounded-2xl border border-zinc-700/50 bg-zinc-900/60 text-zinc-100 shadow-sm shadow-black/20 backdrop-blur-md";

export const appPanelMuted = "rounded-2xl border border-zinc-700/40 bg-zinc-800/30 backdrop-blur-sm";

export const appPageTitle = "text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl";

export const appPageSubtitle = "mt-2 text-sm leading-relaxed text-zinc-400 md:text-base";

export const appSectionTitle = "text-base font-semibold text-zinc-50";

export const appMuted = "text-sm text-zinc-400";

export const appMeta = "text-xs text-zinc-500";

export const appIconTile =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/90 ring-1 ring-zinc-600/50 text-teal-400/90";

export const appLink = "text-teal-400 hover:text-teal-300 underline-offset-2 hover:underline";

export const appGhostBtn = "text-teal-400/90 hover:bg-zinc-800/80 hover:text-teal-300";

export const appPrimaryBtn =
  "rounded-full border-0 bg-teal-600 px-4 font-medium text-white shadow-md shadow-teal-950/30 hover:bg-teal-500";

export const appOutlineBtn =
  "rounded-full border border-zinc-600/60 bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800 hover:text-white";

/** Rectangular outline control for dark app surfaces (forms, secondary actions). */
export const appButtonOutline =
  "border border-zinc-600/60 bg-zinc-800/40 text-zinc-200 shadow-sm hover:bg-zinc-800 hover:text-white";

/** Merge onto `DialogContent` for modals over the dark shell. */
export const appDialogContent =
  "border-zinc-700/50 bg-zinc-900 text-zinc-100 [&>button]:text-zinc-400 [&>button:hover]:text-zinc-50";

export const appEmptyState =
  "flex flex-col items-center justify-center rounded-2xl border border-zinc-700/50 bg-zinc-900/40 py-20 text-center";

export const appFilterBox = `${appPanel} p-4`;

export const appActionRow =
  "flex items-center gap-3 rounded-xl border border-zinc-700/40 bg-zinc-800/30 p-4 transition-colors hover:border-zinc-600/60 hover:bg-zinc-800/50";

export const appPillActive =
  "rounded-full border border-teal-500/50 bg-teal-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm";

export const appPillIdle =
  "rounded-full border border-zinc-600/60 bg-zinc-800/40 px-4 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800";

export const appLabel = "text-xs font-medium uppercase tracking-wide text-zinc-500";

export const appInput =
  "flex h-10 w-full rounded-lg border border-zinc-600/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35";

export const appTextarea =
  "min-h-[120px] w-full rounded-lg border border-zinc-600/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35";

export const appSelect = appInput;

export const appTabsList =
  "inline-flex h-10 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/60 p-1 text-zinc-400";

export const appTabsTrigger =
  "rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-all hover:text-zinc-200 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm";
