"use server";

import { auth } from "@/lib/auth";
import { getFacultyManagedPrograms } from "@/lib/faculty-scope";
import { getAnalytics, searchAlumniForAnalytics } from "@/lib/analytics";
import { rowsToCsv } from "@/lib/csv";
import {
  ANALYTICS_EXPORT_DATASETS,
  type AnalyticsExportDatasetId,
} from "@/lib/analytics-export-datasets";

function num(n: bigint | number | { toString(): string } | null | undefined): number {
  if (n == null) return 0;
  if (typeof n === "bigint") return Number(n);
  if (typeof n === "number") return n;
  return parseFloat(n.toString());
}

export async function exportAnalyticsDatasets(datasetIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };
  if (session.user.role !== "ADMIN" && session.user.role !== "FACULTY") {
    return { error: "Forbidden" as const };
  }

  const allowed = new Set(ANALYTICS_EXPORT_DATASETS.map((d) => d.id));
  const ids = datasetIds.filter((id) => allowed.has(id as AnalyticsExportDatasetId));
  if (ids.length === 0) return { error: "Select at least one dataset." as const };

  const managedPrograms = await getFacultyManagedPrograms(session.user.id, session.user.role);
  const data = await getAnalytics(managedPrograms);

  const files: { filename: string; content: string }[] = [];
  const stamp = new Date().toISOString().slice(0, 10);

  for (const id of ids) {
    switch (id) {
      case "batch_stats":
        files.push({
          filename: `analytics-batch-employment-${stamp}.csv`,
          content: rowsToCsv(
            [
              "rank",
              "batch_year",
              "program",
              "total_alumni",
              "employed_alumni",
              "employment_rate_pct",
            ],
            data.batchStats.map((row) => [
              num(row.employment_rank),
              row.batch_year,
              row.program,
              num(row.total_alumni),
              num(row.employed_alumni),
              num(row.employment_rate),
            ])
          ),
        });
        break;
      case "top_companies":
        files.push({
          filename: `analytics-top-employers-${stamp}.csv`,
          content: rowsToCsv(
            ["company", "alumni_count"],
            data.topCompanies.map((row) => [row.company, num(row.alumni_count)])
          ),
        });
        break;
      case "country_stats":
        files.push({
          filename: `analytics-countries-${stamp}.csv`,
          content: rowsToCsv(
            ["country", "alumni_count", "percentage"],
            data.countryStats.map((row) => [
              row.country,
              num(row.alumni_count),
              num(row.percentage),
            ])
          ),
        });
        break;
      case "career_progression":
        files.push({
          filename: `analytics-career-progression-${stamp}.csv`,
          content: rowsToCsv(
            ["batch_year", "alumni_count", "avg_jobs", "max_jobs"],
            data.careerProgression.map((row) => [
              row.batch_year,
              num(row.total_people),
              num(row.avg_jobs),
              num(row.max_jobs),
            ])
          ),
        });
        break;
      case "registration_trend":
        files.push({
          filename: `analytics-registration-trend-${stamp}.csv`,
          content: rowsToCsv(
            ["month", "count"],
            data.registrationTrend.map((row) => [row.month, num(row.cnt)])
          ),
        });
        break;
      case "students_by_program":
        files.push({
          filename: `analytics-students-by-program-${stamp}.csv`,
          content: rowsToCsv(
            ["program", "student_count"],
            data.studentsByProgram.map((row) => [row.program, num(row.cnt)])
          ),
        });
        break;
      case "program_distribution":
        files.push({
          filename: `analytics-alumni-by-program-${stamp}.csv`,
          content: rowsToCsv(
            ["program", "verified_alumni_count"],
            data.programDistribution.map((row) => [row.program, num(row.cnt)])
          ),
        });
        break;
      case "top_skills":
        files.push({
          filename: `analytics-top-skills-${stamp}.csv`,
          content: rowsToCsv(
            ["skill", "alumni_count"],
            data.topSkills.map((row) => [row.skill_name, num(row.alumni_count)])
          ),
        });
        break;
      case "job_applications":
        files.push({
          filename: `analytics-job-applications-${stamp}.csv`,
          content: rowsToCsv(
            ["status", "count"],
            data.jobAppByStatus.map((row) => [row.status, num(row.cnt)])
          ),
        });
        break;
      case "summary_kpis":
        files.push({
          filename: `analytics-summary-kpis-${stamp}.csv`,
          content: rowsToCsv(
            [
              "verified_alumni",
              "employed_alumni",
              "alumni_abroad",
              "pending_verification",
              "total_students_scoped",
              "job_postings_total",
              "job_postings_active",
              "job_applications_total",
              "published_events",
              "event_rsvps_total",
            ],
            [
              [
                data.totalVerified,
                data.totalEmployed,
                data.abroad,
                data.pendingVerification,
                data.totalStudents,
                data.totalJobPostings,
                data.activeJobPostings,
                data.totalJobApplications,
                data.publishedEvents,
                data.totalRsvps,
              ],
            ]
          ),
        });
        break;
      case "alumni_directory": {
        const { rows } = await searchAlumniForAnalytics(managedPrograms, {
          q: "",
          programFilter: "",
          skip: 0,
          take: 2500,
        });
        files.push({
          filename: `analytics-verified-alumni-directory-${stamp}.csv`,
          content: rowsToCsv(
            [
              "name",
              "email",
              "batch_year",
              "program",
              "roll_number",
              "employed",
              "job_title",
              "company",
              "country",
            ],
            rows.map((r) => [
              r.user.name,
              r.user.email,
              r.batchYear,
              r.program,
              r.rollNumber ?? "",
              r.isEmployed ? "yes" : "no",
              r.currentJobTitle ?? "",
              r.currentCompany ?? "",
              r.country,
            ])
          ),
        });
        break;
      }
      default:
        break;
    }
  }

  return { files };
}
