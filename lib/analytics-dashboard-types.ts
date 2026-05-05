export type AnalyticsClientData = {
  batchStats: Array<{
    batch_year: number;
    program: string;
    total_alumni: number;
    employed_alumni: number;
    employment_rate: number | null;
    employment_rank: number;
  }>;
  topCompanies: Array<{ company: string; alumni_count: number }>;
  countryStats: Array<{ country: string; alumni_count: number; percentage: number | null }>;
  careerProgression: Array<{
    batch_year: number;
    avg_jobs: number | null;
    max_jobs: number;
    total_people: number;
  }>;
  totalVerified: number;
  totalEmployed: number;
  abroad: number;
  totalJobPostings: number;
  activeJobPostings: number;
  totalJobApplications: number;
  publishedEvents: number;
  totalRsvps: number;
  totalStudents: number;
  registrationTrend: Array<{ month: string; cnt: number }>;
  studentsByProgram: Array<{ program: string; cnt: number }>;
  programDistribution: Array<{ program: string; cnt: number }>;
  topSkills: Array<{ skill_name: string; alumni_count: number }>;
  jobAppByStatus: Array<{ status: string; cnt: number }>;
  pendingVerification: number;
};
