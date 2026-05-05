import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { AlumniFilters } from "@/components/alumni/AlumniFilters";
import { AlumniFiltersMobile } from "@/components/alumni/AlumniFiltersMobile";
import { Pagination } from "@/components/ui/pagination";
import { Users } from "lucide-react";
import type { Program } from "@/app/generated/prisma/client";
import { getFacultyManagedPrograms, directoryAlumniProgramFilter } from "@/lib/faculty-scope";
import { BRAND } from "@/lib/brand";
import { appEmptyState, appFilterBox, appPageSubtitle, appPageTitle, appPanel } from "@/lib/app-ui";

export const metadata = { title: "Alumni Directory" };

const PAGE_SIZE = 12;

interface SearchParams {
  search?: string;
  program?: string;
  batch?: string;
  country?: string;
  employed?: string;
  page?: string;
}

async function getAlumni(params: SearchParams, managedPrograms: Program[] | null) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    isVerified: true,
    ...directoryAlumniProgramFilter(managedPrograms, params.program),
    ...(params.batch ? { batchYear: parseInt(params.batch, 10) } : {}),
    ...(params.country ? { country: params.country } : {}),
    ...(params.employed !== undefined && params.employed !== ""
      ? { isEmployed: params.employed === "true" }
      : {}),
    ...(params.search
      ? {
          OR: [
            { user: { name: { contains: params.search } } },
            { currentCompany: { contains: params.search } },
            { currentJobTitle: { contains: params.search } },
            { skills: { some: { skill: { name: { contains: params.search } } } } },
          ],
        }
      : {}),
  };

  const [alumni, total] = await Promise.all([
    db.alumniProfile.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        skills: { include: { skill: { select: { name: true } } } },
      },
    }),
    db.alumniProfile.count({ where }),
  ]);

  return { alumni, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

function buildUrl(params: SearchParams, page: number) {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.program) sp.set("program", params.program);
  if (params.batch) sp.set("batch", params.batch);
  if (params.country) sp.set("country", params.country);
  if (params.employed) sp.set("employed", params.employed);
  sp.set("page", String(page));
  return `/alumni?${sp.toString()}`;
}

export default async function AlumniDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const managedPrograms = await getFacultyManagedPrograms(session.user.id, session.user.role);

  const params = await searchParams;
  const { alumni, total, page, totalPages } = await getAlumni(params, managedPrograms);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className={`${appPanel} px-5 py-6 sm:px-8`}>
        <h1 className={appPageTitle}>Alumni directory</h1>
        <p className={appPageSubtitle}>
          {total.toLocaleString()} verified alumni · {BRAND.institutionShort}
        </p>
        {session.user.role === "FACULTY" && (managedPrograms?.length ?? 0) > 0 && (
          <p className="mt-2 text-xs text-teal-400/90">
            Showing programs you manage: {managedPrograms!.join(", ")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-0 lg:flex-row lg:gap-8">
        <AlumniFiltersMobile
          searchParams={params}
          allowedPrograms={managedPrograms === null ? undefined : managedPrograms}
        />

        <aside className="hidden w-56 shrink-0 lg:block">
          <div className={appFilterBox}>
            <p className="mb-4 text-sm font-semibold text-zinc-300">Filters</p>
            <AlumniFilters
              searchParams={params}
              allowedPrograms={managedPrograms === null ? undefined : managedPrograms}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          {alumni.length === 0 ? (
            <div className={appEmptyState}>
              <Users className="mb-4 h-12 w-12 text-zinc-600" aria-hidden />
              <h2 className="text-lg font-semibold text-zinc-300">No alumni found</h2>
              <p className="mt-1 text-sm text-zinc-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {alumni.map((a) => (
                  <AlumniCard
                    key={a.id}
                    id={a.id}
                    name={a.user.name}
                    program={a.program}
                    batchYear={a.batchYear}
                    currentJobTitle={a.currentJobTitle}
                    currentCompany={a.currentCompany}
                    currentLocation={a.currentLocation}
                    country={a.country}
                    isEmployed={a.isEmployed}
                    skills={a.skills.map((s) => ({ name: s.skill.name }))}
                  />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} buildUrl={(p) => buildUrl(params, p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
