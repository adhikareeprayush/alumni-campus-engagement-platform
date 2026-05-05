export const ANALYTICS_EXPORT_DATASETS = [
  { id: "batch_stats", label: "Employment by batch & program" },
  { id: "top_companies", label: "Top employers" },
  { id: "country_stats", label: "Geographic distribution" },
  { id: "career_progression", label: "Career progression by batch" },
  { id: "registration_trend", label: "Registration / signup trend (monthly)" },
  { id: "students_by_program", label: "Students by program" },
  { id: "program_distribution", label: "Verified alumni by program" },
  { id: "top_skills", label: "Top skills (verified alumni)" },
  { id: "job_applications", label: "Job applications by status" },
  { id: "summary_kpis", label: "Summary KPIs (single row)" },
  { id: "alumni_directory", label: "Verified alumni directory (export)" },
] as const;

export type AnalyticsExportDatasetId = (typeof ANALYTICS_EXPORT_DATASETS)[number]["id"];
