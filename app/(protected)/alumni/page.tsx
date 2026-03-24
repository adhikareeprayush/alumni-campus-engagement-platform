import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { AlumniFilters } from "@/components/alumni/AlumniFilters";
import { Pagination } from "@/components/ui/pagination";
import { Users } from "lucide-react";
import type { Program } from "@/app/generated/prisma/client";
import { getFacultyManagedPrograms, directoryAlumniProgramFilter } from "@/lib/faculty-scope";

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alumni Directory</h1>
        <p className="mt-1 text-gray-500">
          {total.toLocaleString()} verified alumni · IOE Purwanchal Campus
        </p>
        {session.user.role === "FACULTY" && (managedPrograms?.length ?? 0) > 0 && (
          <p className="mt-1 text-xs text-indigo-600">
            Showing programs you manage: {managedPrograms!.join(", ")}
          </p>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-700">Filters</p>
            <AlumniFilters
              searchParams={params}
              allowedPrograms={managedPrograms === null ? undefined : managedPrograms}
            />
          </div>
        </aside>

        {/* Main grid */}
        <div className="flex-1 min-w-0 space-y-5">
          {alumni.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-24 text-center">
              <Users className="mb-4 h-12 w-12 text-gray-200" />
              <h2 className="text-lg font-semibold text-gray-500">No alumni found</h2>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your filters.</p>
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

              <Pagination
                page={page}
                totalPages={totalPages}
                buildUrl={(p) => buildUrl(params, p)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
