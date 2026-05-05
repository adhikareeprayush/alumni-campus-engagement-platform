import { db } from "@/lib/db";
import type { Program } from "@/app/generated/prisma/client";
import type { Prisma } from "@/app/generated/prisma/client";
import { sqlProgramInClause, alumniProgramWhere } from "@/lib/faculty-scope";
import { BRAND } from "@/lib/brand";

type Decimal = { toString(): string };

export type BatchStat = {
  batch_year: number;
  program: string;
  total_alumni: bigint;
  employed_alumni: bigint;
  employment_rate: Decimal | number | null;
  employment_rank: bigint;
};

export type TopCompany = {
  company: string;
  alumni_count: bigint;
};

export type CountryStat = {
  country: string;
  alumni_count: bigint;
  percentage: Decimal | number | null;
};

export type CareerProgression = {
  batch_year: number;
  avg_jobs: Decimal | number | null;
  max_jobs: bigint;
  total_people: bigint;
};

export type MonthCount = {
  month: string;
  cnt: bigint;
};

export type ProgramCount = {
  program: string;
  cnt: bigint;
};

export type StatusCount = {
  status: string;
  cnt: bigint;
};

export type SkillStatRow = {
  skill_name: string;
  alumni_count: bigint;
};

export type AlumniExplorerRow = {
  id: string;
  batchYear: number;
  program: string;
  rollNumber: string | null;
  currentCompany: string | null;
  currentJobTitle: string | null;
  country: string;
  isEmployed: boolean;
  user: { name: string; email: string };
};

export async function getAnalytics(managedPrograms: Program[] | null) {
  const p = sqlProgramInClause(managedPrograms, "program");
  const pa = sqlProgramInClause(managedPrograms, "a.program");
  const pStudent = sqlProgramInClause(managedPrograms, "program");
  const apWhere: Prisma.AlumniProfileWhereInput = {
    isVerified: true as const,
    ...alumniProgramWhere(managedPrograms),
  };

  const registrationSql =
    managedPrograms === null
      ? `
      SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt
      FROM User
      GROUP BY month
      ORDER BY month DESC
      LIMIT 36
    `
      : `
      SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS cnt
      FROM AlumniProfile
      WHERE isVerified = 1${p}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 36
    `;

  const [
    batchStats,
    topCompanies,
    countryStats,
    careerProgression,
    overview,
    registrationTrend,
    studentsByProgram,
    programDistribution,
    topSkills,
    jobAppByStatus,
    pendingVerification,
  ] = await Promise.all([
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
      LIMIT 80
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
      LIMIT 25
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
      LIMIT 20
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
      LIMIT 24
    `),

    Promise.all([
      db.alumniProfile.count({ where: apWhere }),
      db.alumniProfile.count({ where: { ...apWhere, isEmployed: true } }),
      db.alumniProfile.count({
        where: { ...apWhere, country: { not: BRAND.homeCountry } },
      }),
      db.jobPosting.count(),
      db.jobPosting.count({ where: { isActive: true } }),
      db.jobApplication.count(),
      db.event.count({ where: { isPublished: true } }),
      db.eventRsvp.count(),
      db.studentProfile.count({
        where:
          managedPrograms === null
            ? {}
            : managedPrograms.length === 0
              ? { program: { in: [] } }
              : { program: { in: managedPrograms } },
      }),
    ]),

    db.$queryRawUnsafe<MonthCount[]>(registrationSql),

    db.$queryRawUnsafe<ProgramCount[]>(`
      SELECT program, COUNT(*) AS cnt
      FROM StudentProfile
      WHERE 1=1${pStudent}
      GROUP BY program
      ORDER BY cnt DESC
    `),

    db.$queryRawUnsafe<ProgramCount[]>(`
      SELECT program, COUNT(*) AS cnt
      FROM AlumniProfile
      WHERE isVerified = 1${p}
      GROUP BY program
      ORDER BY cnt DESC
    `),

    db.$queryRawUnsafe<SkillStatRow[]>(`
      SELECT s.name AS skill_name, COUNT(*) AS alumni_count
      FROM AlumniSkill ask
      INNER JOIN Skill s ON s.id = ask.skillId
      INNER JOIN AlumniProfile a ON a.id = ask.profileId
      WHERE a.isVerified = 1${pa}
      GROUP BY s.id, s.name
      ORDER BY alumni_count DESC
      LIMIT 20
    `),

    db.$queryRawUnsafe<StatusCount[]>(`
      SELECT status, COUNT(*) AS cnt
      FROM JobApplication
      GROUP BY status
    `),

    db.alumniProfile.count({
      where: { isVerified: false, ...alumniProgramWhere(managedPrograms) },
    }),
  ]);

  const [
    totalVerified,
    totalEmployed,
    abroad,
    totalJobPostings,
    activeJobPostings,
    totalJobApplications,
    publishedEvents,
    totalRsvps,
    totalStudents,
  ] = overview;

  return {
    batchStats,
    topCompanies,
    countryStats,
    careerProgression,
    totalVerified,
    totalEmployed,
    abroad,
    totalJobPostings,
    activeJobPostings,
    totalJobApplications,
    publishedEvents,
    totalRsvps,
    totalStudents,
    registrationTrend,
    studentsByProgram,
    programDistribution,
    topSkills,
    jobAppByStatus,
    pendingVerification,
  };
}

export async function searchAlumniForAnalytics(
  managedPrograms: Program[] | null,
  params: {
    q: string;
    programFilter: string;
    skip: number;
    take: number;
  },
) {
  const q = params.q.trim();
  const programEnum =
    params.programFilter &&
    [
      "BCT",
      "BEX",
      "BIT",
      "BCE",
      "BME",
      "BEE",
      "BAG",
      "BAM",
      "OTHER",
    ].includes(params.programFilter)
      ? (params.programFilter as Program)
      : undefined;

  const where: Prisma.AlumniProfileWhereInput = {
    isVerified: true,
    ...alumniProgramWhere(managedPrograms),
    ...(programEnum ? { program: programEnum } : {}),
    ...(q
      ? {
          OR: [
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
            { currentCompany: { contains: q } },
            { currentJobTitle: { contains: q } },
            { rollNumber: { contains: q } },
            { currentLocation: { contains: q } },
            { country: { contains: q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.alumniProfile.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: [{ batchYear: "desc" }, { program: "asc" }, { id: "asc" }],
      select: {
        id: true,
        batchYear: true,
        program: true,
        rollNumber: true,
        currentCompany: true,
        currentJobTitle: true,
        country: true,
        isEmployed: true,
        user: { select: { name: true, email: true } },
      },
    }),
    db.alumniProfile.count({ where }),
  ]);

  return { rows, total } satisfies {
    rows: AlumniExplorerRow[];
    total: number;
  };
}
