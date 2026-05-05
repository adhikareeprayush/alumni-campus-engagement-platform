"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Building2,
  Globe,
  Users,
  Award,
  BarChart3,
  Search,
  Download,
  Loader2,
  Briefcase,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { analyticsExplorerSearch } from "@/lib/actions/analytics-explorer";
import { exportAnalyticsDatasets } from "@/lib/actions/analytics-export";
import { ANALYTICS_EXPORT_DATASETS } from "@/lib/analytics-export-datasets";
import { toast } from "sonner";
import type { Program } from "@/app/generated/prisma/client";
import type { AlumniExplorerRow } from "@/lib/analytics";
import type { AnalyticsClientData } from "@/lib/analytics-dashboard-types";
import { cn } from "@/lib/utils";
import { appIconTile, appPageTitle, appPanel, appTabsList, appTabsTrigger } from "@/lib/app-ui";

const PIE_COLORS = [
  "#4f46e5",
  "#6366f1",
  "#818cf8",
  "#a5b4fc",
  "#c7d2fe",
  "#94a3b8",
  "#64748b",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
];

export type { AnalyticsClientData };

function num(n: number | string | bigint | { toString(): string } | null | undefined) {
  if (n == null) return 0;
  if (typeof n === "number") return Number.isFinite(n) ? n : 0;
  if (typeof n === "bigint") return Number(n);
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(n.toString());
  return Number.isFinite(parsed) ? parsed : 0;
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function filterRows<T extends Record<string, unknown>>(rows: T[], q: string): T[] {
  const s = q.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter((row) =>
    Object.values(row).some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(s)
    )
  );
}

type Props = {
  data: AnalyticsClientData;
  facultyPrograms: Program[] | null;
  role: "ADMIN" | "FACULTY";
};

export function AnalyticsExperience({ data, facultyPrograms, role }: Props) {
  const [tableSearch, setTableSearch] = useState("");
  const [explorerQ, setExplorerQ] = useState("");
  const [debouncedExplorerQ, setDebouncedExplorerQ] = useState("");
  const [explorerProgram, setExplorerProgram] = useState<string>("all");
  const [explorerPage, setExplorerPage] = useState(1);
  const [explorerRows, setExplorerRows] = useState<AlumniExplorerRow[]>([]);
  const [explorerTotal, setExplorerTotal] = useState(0);
  const [exportSelection, setExportSelection] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ANALYTICS_EXPORT_DATASETS.map((d) => [d.id, false]))
  );
  const [pendingExplorer, startExplorer] = useTransition();
  const [pendingExport, startExport] = useTransition();

  const overallRate =
    data.totalVerified > 0 ? Math.round((data.totalEmployed / data.totalVerified) * 100) : 0;

  const regChart = useMemo(
    () => [...data.registrationTrend].reverse().map((r) => ({ month: r.month, signups: r.cnt })),
    [data.registrationTrend]
  );

  const countryPie = useMemo(() => {
    const top = data.countryStats.slice(0, 8);
    const rest = data.countryStats.slice(8);
    const restSum = rest.reduce((acc, c) => acc + c.alumni_count, 0);
    if (restSum > 0) {
      return [...top, { country: "Other", alumni_count: restSum, percentage: null }];
    }
    return top.map((c) => ({ ...c, percentage: c.percentage }));
  }, [data.countryStats]);

  const filteredBatch = useMemo(
    () => filterRows(data.batchStats as unknown as Record<string, unknown>[], tableSearch),
    [data.batchStats, tableSearch]
  ) as AnalyticsClientData["batchStats"];

  const filteredCompanies = useMemo(
    () => filterRows(data.topCompanies as unknown as Record<string, unknown>[], tableSearch),
    [data.topCompanies, tableSearch]
  ) as AnalyticsClientData["topCompanies"];

  useEffect(() => {
    const t = setTimeout(() => setDebouncedExplorerQ(explorerQ), 400);
    return () => clearTimeout(t);
  }, [explorerQ]);

  useEffect(() => {
    startExplorer(async () => {
      const res = await analyticsExplorerSearch({
        q: debouncedExplorerQ,
        programFilter: explorerProgram === "all" ? "" : explorerProgram,
        page: explorerPage,
        pageSize: 25,
      });
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      if ("rows" in res) {
        setExplorerRows(res.rows);
        setExplorerTotal(res.total);
      }
    });
  }, [debouncedExplorerQ, explorerProgram, explorerPage]);

  const runExplorer = useCallback(() => {
    startExplorer(async () => {
      const res = await analyticsExplorerSearch({
        q: debouncedExplorerQ,
        programFilter: explorerProgram === "all" ? "" : explorerProgram,
        page: explorerPage,
        pageSize: 25,
      });
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      if ("rows" in res) {
        setExplorerRows(res.rows);
        setExplorerTotal(res.total);
      }
    });
  }, [debouncedExplorerQ, explorerProgram, explorerPage]);

  const totalExplorerPages = Math.max(1, Math.ceil(explorerTotal / 25));

  const toggleExport = (id: string, checked: boolean) => {
    setExportSelection((prev) => ({ ...prev, [id]: checked }));
  };

  const selectAllExport = (on: boolean) => {
    setExportSelection(Object.fromEntries(ANALYTICS_EXPORT_DATASETS.map((d) => [d.id, on])));
  };

  const handleExport = () => {
    const ids = ANALYTICS_EXPORT_DATASETS.filter((d) => exportSelection[d.id]).map((d) => d.id);
    if (ids.length === 0) {
      toast.message("Choose one or more datasets to export.");
      return;
    }
    startExport(async () => {
      const res = await exportAnalyticsDatasets(ids);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      res.files.forEach((f, i) => {
        setTimeout(() => downloadCsv(f.filename, f.content), i * 250);
      });
      toast.success(`Downloading ${res.files.length} CSV file(s).`);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={appPageTitle}>Analytics</h1>
        {role === "FACULTY" && facultyPrograms && facultyPrograms.length > 0 && (
          <p className="mt-2 text-xs text-teal-400">
            Alumni metrics below are limited to: <strong>{facultyPrograms.join(", ")}</strong>. Job
            postings, applications, and events are campus-wide.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {[
          { label: "Verified alumni", value: data.totalVerified, icon: Users },
          { label: "Employment rate", value: `${overallRate}%`, icon: TrendingUp },
          { label: "Alumni abroad", value: data.abroad, icon: Globe },
          { label: "Pending verification", value: data.pendingVerification, icon: Award },
          { label: "Students (scoped)", value: data.totalStudents, icon: GraduationCap },
          { label: "Active jobs", value: data.activeJobPostings, icon: Briefcase },
          { label: "Job applications", value: data.totalJobApplications, icon: BarChart3 },
          { label: "Published events", value: data.publishedEvents, icon: CalendarDays },
          { label: "Event RSVPs", value: data.totalRsvps, icon: CalendarDays },
          { label: "All job postings", value: data.totalJobPostings, icon: Building2 },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={appPanel}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-zinc-500">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-50">
                      {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                    </p>
                  </div>
                  <div className={appIconTile}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className={cn(appPanel, "lg:col-span-2")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">
              {role === "ADMIN"
                ? "User signups by month"
                : "New verified alumni (your programs) by month"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {regChart.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">No trend data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={regChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-zinc-500" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className={appPanel}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Alumni by program</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {data.programDistribution.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.programDistribution}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-700" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="program" width={44} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="cnt" fill="#6366f1" radius={[0, 4, 4, 0]} name="Alumni" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={appPanel}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Top countries</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {countryPie.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryPie}
                    dataKey="alumni_count"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {countryPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className={appPanel}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">
              Job applications by status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {data.jobAppByStatus.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">No applications yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.jobAppByStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-700" />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cnt" fill="#0d9488" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={appPanel}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-200">Students by program</CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          {data.studentsByProgram.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No student records in scope.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.studentsByProgram}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-700" />
                <XAxis dataKey="program" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cnt" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList className={cn(appTabsList, "h-auto flex-wrap gap-1")}>
          <TabsTrigger value="tables" className={appTabsTrigger}>
            Tables & search
          </TabsTrigger>
          <TabsTrigger value="explorer" className={appTabsTrigger}>
            Alumni explorer
          </TabsTrigger>
          <TabsTrigger value="skills" className={appTabsTrigger}>
            Skills
          </TabsTrigger>
          <TabsTrigger value="export" className={appTabsTrigger}>
            Export CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              Filter employment, employers, and geography tables with one search box.
            </p>
            <div className="relative w-full sm:w-72">
              <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search tables…"
                className="pl-9"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className={appPanel}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-400" />
                <CardTitle className="text-base">Employment by batch & program</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBatch.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">No rows match your search.</p>
              ) : (
                <div className="max-h-[420px] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-white shadow-sm">
                      <tr className="border-b text-left text-xs font-medium text-zinc-500">
                        <th className="pr-4 pb-2">Rank</th>
                        <th className="pr-4 pb-2">Batch</th>
                        <th className="pr-4 pb-2">Program</th>
                        <th className="pr-4 pb-2">Total</th>
                        <th className="pr-4 pb-2">Employed</th>
                        <th className="pb-2">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredBatch.map((row) => (
                        <tr key={`${row.batch_year}-${row.program}`} className="hover:bg-zinc-800/40">
                          <td className="py-2 pr-4">
                            {row.employment_rank === 1 && (
                              <Award className="inline h-4 w-4 text-amber-500" />
                            )}
                            <span className="ml-1 text-zinc-500">#{row.employment_rank}</span>
                          </td>
                          <td className="py-2 pr-4 font-medium">{row.batch_year}</td>
                          <td className="py-2 pr-4">
                            <Badge variant="secondary" className="text-xs">
                              {row.program}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-zinc-500">{row.total_alumni}</td>
                          <td className="py-2 pr-4 text-zinc-500">{row.employed_alumni}</td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 rounded-full bg-zinc-800/60">
                                <div
                                  className="h-2 rounded-full bg-teal-950/400"
                                  style={{ width: `${num(row.employment_rate)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-zinc-200">
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className={appPanel}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base">Top employers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCompanies.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500">No matches.</p>
                ) : (
                  <div className="max-h-[360px] space-y-2 overflow-y-auto">
                    {filteredCompanies.map((c, idx) => (
                      <div key={c.company} className="flex items-center gap-3">
                        <span className="w-6 text-center text-sm font-bold text-zinc-400">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-50">{c.company}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {c.alumni_count} alumni
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className={appPanel}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Geographic distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data.countryStats.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500">No data.</p>
                ) : (
                  <div className="max-h-[360px] space-y-2 overflow-y-auto">
                    {filterRows(
                      data.countryStats as unknown as Record<string, unknown>[],
                      tableSearch
                    ).map((c) => (
                      <div key={String(c.country)} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-zinc-100">{String(c.country)}</span>
                          <span className="text-zinc-500">
                            {Number(c.alumni_count)} (
                            {c.percentage != null ? Number(c.percentage) : "—"}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-800/60">
                          <div
                            className="h-1.5 rounded-full bg-blue-400"
                            style={{
                              width: `${c.percentage != null ? Number(c.percentage) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className={appPanel}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">Career progression by batch</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {filterRows(
                data.careerProgression as unknown as Record<string, unknown>[],
                tableSearch
              ).length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">No matches.</p>
              ) : (
                <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b text-left text-xs font-medium text-zinc-500">
                        <th className="pr-6 pb-2">Batch</th>
                        <th className="pr-6 pb-2">Alumni</th>
                        <th className="pr-6 pb-2">Avg jobs</th>
                        <th className="pb-2">Max jobs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(
                        filterRows(
                          data.careerProgression as unknown as Record<string, unknown>[],
                          tableSearch
                        ) as unknown as AnalyticsClientData["careerProgression"]
                      ).map((row) => (
                        <tr key={row.batch_year} className="hover:bg-zinc-800/40">
                          <td className="py-2 pr-6 font-medium">{row.batch_year}</td>
                          <td className="py-2 pr-6 text-zinc-500">{row.total_people}</td>
                          <td className="py-2 pr-6">
                            <span className="font-semibold text-amber-600">
                              {num(row.avg_jobs) > 0 ? num(row.avg_jobs).toFixed(1) : "—"}
                            </span>
                          </td>
                          <td className="py-2 text-zinc-500">{row.max_jobs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explorer" className="space-y-4">
          <Card className={appPanel}>
            <CardHeader>
              <CardTitle className="text-base">Search verified alumni</CardTitle>
              <p className="text-sm text-zinc-500">
                Search by name, email, company, title, roll number, location, or country. Results
                respect your program scope.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="min-w-[200px] flex-1 space-y-2">
                  <Label>Search</Label>
                  <Input
                    placeholder="e.g. Sharma, Google, BCT…"
                    value={explorerQ}
                    onChange={(e) => {
                      setExplorerQ(e.target.value);
                      setExplorerPage(1);
                    }}
                  />
                </div>
                <div className="w-full space-y-2 sm:w-44">
                  <Label>Program</Label>
                  <Select
                    value={explorerProgram}
                    onValueChange={(v) => {
                      setExplorerProgram(v);
                      setExplorerPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All in scope</SelectItem>
                      {["BCT", "BEX", "BIT", "BCE", "BME", "BEE", "BAG", "BAM", "OTHER"].map(
                        (p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={runExplorer} disabled={pendingExplorer}>
                  {pendingExplorer ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-zinc-800/40 text-left text-xs font-medium text-zinc-500">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Program</th>
                      <th className="p-3">Employed</th>
                      <th className="p-3">Role / company</th>
                      <th className="p-3">Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {explorerRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          {pendingExplorer ? "Loading…" : "No results."}
                        </td>
                      </tr>
                    ) : (
                      explorerRows.map((r) => (
                        <tr key={r.id} className="hover:bg-zinc-800/40">
                          <td className="p-3 font-medium text-zinc-50">{r.user.name}</td>
                          <td className="p-3 text-zinc-400">{r.user.email}</td>
                          <td className="p-3">{r.batchYear}</td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-xs">
                              {r.program}
                            </Badge>
                          </td>
                          <td className="p-3">{r.isEmployed ? "Yes" : "No"}</td>
                          <td className="p-3 text-zinc-400">
                            {[r.currentJobTitle, r.currentCompany].filter(Boolean).join(" · ") ||
                              "—"}
                          </td>
                          <td className="p-3">{r.country}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
                <span>
                  {explorerTotal.toLocaleString()} result{explorerTotal !== 1 ? "s" : ""} · page{" "}
                  {explorerPage} of {totalExplorerPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={explorerPage <= 1 || pendingExplorer}
                    onClick={() => setExplorerPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={explorerPage >= totalExplorerPages || pendingExplorer}
                    onClick={() => setExplorerPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card className={appPanel}>
            <CardHeader>
              <CardTitle className="text-base">Top skills among verified alumni</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topSkills.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">No skill data in scope.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-zinc-500">
                        <th className="pr-4 pb-2">#</th>
                        <th className="pr-4 pb-2">Skill</th>
                        <th className="pb-2">Alumni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.topSkills.map((s, i) => (
                        <tr key={s.skill_name}>
                          <td className="py-2 pr-4 text-zinc-500">{i + 1}</td>
                          <td className="py-2 pr-4 font-medium">{s.skill_name}</td>
                          <td className="py-2">{s.alumni_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card className={appPanel}>
            <CardHeader>
              <CardTitle className="text-base">Export analytics as CSV</CardTitle>
              <p className="text-sm text-zinc-500">
                Select any combination of datasets. Each set downloads as its own UTF-8 CSV
                (Excel-friendly).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllExport(true)}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllExport(false)}
                >
                  Clear
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {ANALYTICS_EXPORT_DATASETS.map((d) => (
                  <label
                    key={d.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-700/40 bg-zinc-800/40/80 p-3 hover:bg-zinc-800/40"
                  >
                    <Checkbox
                      checked={!!exportSelection[d.id]}
                      onCheckedChange={(c) => toggleExport(d.id, c === true)}
                    />
                    <span className="text-sm leading-snug">{d.label}</span>
                  </label>
                ))}
              </div>
              <Button
                onClick={handleExport}
                disabled={pendingExport}
                className="bg-teal-600 hover:bg-teal-500"
              >
                {pendingExport ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="ml-2">Download selected</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
