import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Program } from "@/app/generated/prisma/client";
import { getFacultyManagedPrograms, sqlProgramInClause, alumniProgramWhere } from "@/lib/faculty-scope";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Building2, Globe, Users, Award, BarChart3 } from "lucide-react";

export const metadata = { title: "Analytics" };

// ---------------------------------------------------------------------------
// Raw MySQL queries with window functions
// ---------------------------------------------------------------------------

// MariaDB returns computed numeric columns as Decimal objects (not plain numbers).
type Decimal = { toString(): string };

type BatchStat = {
  batch_year: number;
  program: string;
  total_alumni: bigint;
  employed_alumni: bigint;
  employment_rate: Decimal | number | null;
  employment_rank: bigint;
};

type TopCompany = {
  company: string;
  alumni_count: bigint;
};

type CountryStat = {
  country: string;
  alumni_count: bigint;
  percentage: Decimal | number | null;
};

type CareerProgression = {
  batch_year: number;
  avg_jobs: Decimal | number | null;
  max_jobs: bigint;
  total_people: bigint;
};

async function getAnalytics(managedPrograms: Program[] | null) {
  const p = sqlProgramInClause(managedPrograms, "program");
  const pa = sqlProgramInClause(managedPrograms, "a.program");
  const apWhere = { isVerified: true as const, ...alumniProgramWhere(managedPrograms) };

  const [batchStats, topCompanies, countryStats, careerProgression, overview] = await Promise.all([
    db.$queryRawUnsafe<BatchStat[]>(`
      SELECT
        batchYear   AS batch_year,
        program,
        COUNT(*)    AS total_alumni,
        SUM(isEmployed)  AS employed_alumni,
        ROUND(SUM(isEmployed) / COUNT(*) * 100, 1) AS employment_rate,
        RANK() OVER (ORDER BY SUM(isEmployed) / COUNT(*) DESC) AS employment_rank
      FROM AlumniProfile
      WHERE isVerified = 1${p}
      GROUP BY batchYear, program
      ORDER BY batchYear DESC, program
      LIMIT 30
    `),

    db.$queryRawUnsafe<TopCompany[]>(`
      SELECT
        currentCompany AS company,
        COUNT(*) AS alumni_count
      FROM AlumniProfile
      WHERE currentCompany IS NOT NULL
        AND currentCompany != ''
        AND isVerified = 1
        AND isEmployed = 1${p}
      GROUP BY currentCompany
      ORDER BY alumni_count DESC
      LIMIT 10
    `),

    db.$queryRawUnsafe<CountryStat[]>(`
      SELECT
        country,
        COUNT(*) AS alumni_count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
      FROM AlumniProfile
      WHERE isVerified = 1${p}
      GROUP BY country
      ORDER BY alumni_count DESC
      LIMIT 10
    `),

    db.$queryRawUnsafe<CareerProgression[]>(`
      SELECT
        a.batchYear AS batch_year,
        ROUND(AVG(job_counts.cnt), 2) AS avg_jobs,
        MAX(job_counts.cnt) AS max_jobs,
        COUNT(DISTINCT a.id) AS total_people
      FROM AlumniProfile a
      LEFT JOIN (
        SELECT profileId, COUNT(*) AS cnt
        FROM JobHistory
        GROUP BY profileId
      ) AS job_counts ON job_counts.profileId = a.id
      WHERE a.isVerified = 1${pa}
      GROUP BY a.batchYear
      ORDER BY a.batchYear DESC
      LIMIT 15
    `),

    Promise.all([
      db.alumniProfile.count({ where: apWhere }),
      db.alumniProfile.count({ where: { ...apWhere, isEmployed: true } }),
      db.alumniProfile.count({
        where: { ...apWhere, country: { not: "Nepal" } },
      }),
      db.jobPosting.count(),
    ]),
  ]);

  const [totalVerified, totalEmployed, abroad, totalJobPostings] = overview;

  return {
    batchStats,
    topCompanies,
    countryStats,
    careerProgression,
    totalVerified,
    totalEmployed,
    abroad,
    totalJobPostings,
  };
}

// MariaDB driver returns ROUND/division results as Decimal objects, not plain JS
// numbers, so we must handle them explicitly.
function num(n: bigint | number | { toString(): string } | null | undefined): number {
  if (n == null) return 0;
  if (typeof n === "bigint") return Number(n);
  if (typeof n === "number") return n;
  return parseFloat(n.toString());
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") redirect("/dashboard");

  const managedPrograms = await getFacultyManagedPrograms(session.user.id, session.user.role);

  const {
    batchStats,
    topCompanies,
    countryStats,
    careerProgression,
    totalVerified,
    totalEmployed,
    abroad,
    totalJobPostings,
  } = await getAnalytics(managedPrograms);

  const overallRate = totalVerified > 0 ? Math.round((totalEmployed / totalVerified) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Powered by MySQL window functions (RANK, ROW_NUMBER, AVG OVER), views, and triggers.
        </p>
        {session.user.role === "FACULTY" && (managedPrograms?.length ?? 0) > 0 && (
          <p className="mt-2 text-xs text-indigo-600">
            Alumni metrics below are limited to: <strong>{managedPrograms!.join(", ")}</strong>.
            Job postings count is campus-wide.
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Verified Alumni", value: totalVerified.toLocaleString(), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Employment Rate", value: `${overallRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Alumni Abroad", value: abroad.toLocaleString(), icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
          {
            label: "Job postings",
            value: totalJobPostings.toLocaleString(),
            icon: BarChart3,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Batch employment stats (window function: RANK) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Employment by Batch & Program</CardTitle>
            </div>
            <CardDescription>
              Uses <code className="text-xs bg-gray-100 px-1 rounded">RANK() OVER (ORDER BY employment_rate DESC)</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {batchStats.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No verified alumni data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium text-gray-400">
                      <th className="pb-2 pr-4">Rank</th>
                      <th className="pb-2 pr-4">Batch</th>
                      <th className="pb-2 pr-4">Program</th>
                      <th className="pb-2 pr-4">Total</th>
                      <th className="pb-2 pr-4">Employed</th>
                      <th className="pb-2">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {batchStats.map((row) => (
                      <tr key={`${row.batch_year}-${row.program}`} className="hover:bg-gray-50">
                        <td className="py-2 pr-4">
                          {num(row.employment_rank) === 1 && <Award className="h-4 w-4 text-amber-500 inline" />}
                          <span className="ml-1 text-gray-400">#{num(row.employment_rank)}</span>
                        </td>
                        <td className="py-2 pr-4 font-medium">{row.batch_year}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary" className="text-xs">{row.program}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-gray-500">{num(row.total_alumni)}</td>
                        <td className="py-2 pr-4 text-gray-500">{num(row.employed_alumni)}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-gray-100">
                              <div
                                className="h-2 rounded-full bg-indigo-500"
                                style={{ width: `${num(row.employment_rate)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {num(row.employment_rate)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top companies (ROW_NUMBER window function) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">Top Employers</CardTitle>
            </div>
            <CardDescription>
              Uses <code className="text-xs bg-gray-100 px-1 rounded">ROW_NUMBER() OVER (ORDER BY COUNT DESC)</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topCompanies.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No company data yet.</p>
            ) : (
              <div className="space-y-3">
                {topCompanies.map((c, idx) => (
                  <div key={c.company} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-bold text-gray-300">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{c.company}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {num(c.alumni_count)} alumni
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country distribution (AVG OVER window) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Geographic Distribution</CardTitle>
            </div>
            <CardDescription>
              Uses <code className="text-xs bg-gray-100 px-1 rounded">SUM(COUNT(*)) OVER ()</code> for percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {countryStats.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No location data yet.</p>
            ) : (
              <div className="space-y-3">
                {countryStats.map((c) => (
                  <div key={c.country} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{c.country}</span>
                      <span className="text-gray-400">
                        {num(c.alumni_count)} ({num(c.percentage)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-blue-400"
                        style={{ width: `${num(c.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career progression (AVG OVER PARTITION BY) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base">Career Progression by Batch</CardTitle>
            </div>
            <CardDescription>
              Average number of job changes per alumni — uses <code className="text-xs bg-gray-100 px-1 rounded">AVG() OVER (PARTITION BY batchYear)</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {careerProgression.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No career data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium text-gray-400">
                      <th className="pb-2 pr-6">Batch</th>
                      <th className="pb-2 pr-6">Alumni</th>
                      <th className="pb-2 pr-6">Avg Jobs</th>
                      <th className="pb-2">Max Jobs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {careerProgression.map((row) => (
                      <tr key={row.batch_year} className="hover:bg-gray-50">
                        <td className="py-2 pr-6 font-medium">{row.batch_year}</td>
                        <td className="py-2 pr-6 text-gray-500">{num(row.total_people)}</td>
                        <td className="py-2 pr-6">
                          <span className="font-semibold text-amber-600">
                            {num(row.avg_jobs) > 0 ? num(row.avg_jobs).toFixed(1) : "—"}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">{num(row.max_jobs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DBMS features note */}
      <Card className="border-dashed border-indigo-200 bg-indigo-50/50">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-indigo-800 mb-2">MySQL DBMS Features Used on This Page</p>
          <div className="grid gap-1 sm:grid-cols-2 text-xs text-indigo-700">
            <span>✓ <code>RANK() OVER (ORDER BY ...)</code> — employment ranking</span>
            <span>✓ <code>ROW_NUMBER() OVER (ORDER BY ...)</code> — company list</span>
            <span>✓ <code>SUM(...) OVER ()</code> — percentage calculation</span>
            <span>✓ <code>AVG() OVER (PARTITION BY)</code> — career progression</span>
            <span>✓ Trigger: <code>after_alumni_profile_update</code></span>
            <span>✓ Views: <code>vw_batch_employment_stats</code>, <code>vw_top_companies</code></span>
            <span>✓ Stored Procedure: <code>sp_batch_summary()</code></span>
            <span>✓ Subquery aggregation for avg job count</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
