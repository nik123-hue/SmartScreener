"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  CircleCheck,
  FileText,
  LayoutDashboard,
  Layers3,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
  ArrowUpRight,
} from "lucide-react";

import { API_BASE } from "../config";
import JobInput from "./job-input";
import UploadZone from "./upload-zone";
import Leaderboard from "./leaderboard";
import CandidateDetail from "./candidate-detail";
import ComparisonMatrix from "./comparison-matrix";

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  created_at: string;
}

interface Candidate {
  id: number;
  job_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: {
    years: number;
    roles: string[];
    companies: string[];
  };
  education: string | null;
  summary: string | null;
  score: number;
  technical_score: number;
  experience_score: number;
  education_score: number;
  resume_text: string | null;
  created_at: string;
}

type View = "dashboard" | "jobs" | "upload";

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCandidate, setActiveCandidate] =
    useState<Candidate | null>(null);
  const [comparingIds, setComparingIds] = useState<number[] | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobs();
    checkHealth();
  }, []);

  useEffect(() => {
    if (activeJob) fetchCandidates(activeJob.id);
    else setCandidates([]);
  }, [activeJob]);

  async function checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/api/health`);

      if (response.ok) {
        setHealthStatus(await response.json());
      }
    } catch {
      setHealthStatus(null);
    }
  }

  async function fetchJobs() {
    try {
      const response = await fetch(`${API_BASE}/api/jobs`);

      if (!response.ok) return;

      const data = await response.json();

      setJobs(data);

      if (data.length && !activeJob) {
        setActiveJob(data[0]);
      }
    } catch (error) {
      console.error("Failed to load jobs", error);
    }
  }

  async function fetchCandidates(jobId: number) {
    try {
      const response = await fetch(
        `${API_BASE}/api/jobs/${jobId}/candidates`
      );

      if (response.ok) {
        setCandidates(await response.json());
      }
    } catch (error) {
      console.error("Failed to load candidates", error);
    }
  }

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return candidates;

    return candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.email?.toLowerCase().includes(query) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        )
    );
  }, [candidates, search]);

  const handleJobCreated = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
    setActiveJob(job);
    setView("dashboard");
  };

  const handleCandidatesProcessed = () => {
    if (activeJob) fetchCandidates(activeJob.id);
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Delete this job and all its candidates?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) return;

      const nextJobs = jobs.filter((job) => job.id !== jobId);

      setJobs(nextJobs);
      setActiveJob(nextJobs[0] || null);
    } catch {
      alert("Failed to delete the job.");
    }
  };

  const navigate = (nextView: View) => {
    setView(nextView);
    setSidebarOpen(false);
  };

  const navItems = [
    {
      id: "dashboard" as View,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "jobs" as View,
      label: "Job Pipelines",
      icon: BriefcaseBusiness,
    },
    {
      id: "upload" as View,
      label: "Screen Resumes",
      icon: Upload,
    },
  ];

  const averageScore = candidates.length
    ? Math.round(
        candidates.reduce((sum, candidate) => sum + candidate.score, 0) /
          candidates.length
      )
    : 0;

  const shortlisted = candidates.filter(
    (candidate) => candidate.score >= 80
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[255px] flex-col border-r border-slate-800/60 bg-[#101722] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#101722]" />
            </div>

            <div>
              <p className="text-[15px] font-extrabold tracking-tight">
                SmartScreener
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                AI Recruiting
              </p>
            </div>
          </div>

          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 py-7">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/30"
                      : "text-slate-400 hover:bg-white/[0.055] hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 h-5 w-0.5 rounded-full bg-white" />
                  )}

                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-200"
                    }`}
                  />

                  {item.label}

                  {item.id === "upload" && activeJob && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto border-t border-white/[0.07] p-4">
          <div className="mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <CircleCheck className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <p className="text-xs font-bold">Screening engine</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {healthStatus?.ollama_status === "connected"
                    ? "Ollama LLM connected"
                    : "Fallback NLP ready"}
                </p>
              </div>
            </div>
          </div>

          <button
  onClick={() => {
    window.location.href = "/";
  }}
  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
>
  <LogOut className="h-[18px] w-[18px]" />
  Sign out
</button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-h-screen lg:pl-[255px]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[76px] items-center gap-4 px-5 sm:px-8">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-slate-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Recruiting workspace
              </p>

              <h1 className="mt-0.5 truncate text-[17px] font-extrabold text-slate-950">
                {view === "dashboard"
                  ? "Overview"
                  : view === "jobs"
                  ? "Job Pipelines"
                  : "Resume Screening"}
              </h1>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-700">
                System online
              </span>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20">
              NK
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] p-5 sm:p-8">
          {/* DASHBOARD */}
          {view === "dashboard" && (
            <>
              {/* Hero */}
              <section className="relative mb-8 overflow-hidden rounded-[26px] border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/70 p-6 shadow-sm sm:p-8">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-100px] right-[25%] h-48 w-48 rounded-full bg-violet-200/20 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                        AI-powered screening
                      </span>
                    </div>

                    <h2 className="max-w-2xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                      Candidate screening,
                      <br className="hidden sm:block" />
                      <span className="text-indigo-600"> simplified.</span>
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                      Create a role, upload resumes and let SmartScreener
                      organize candidates using your existing AI scoring
                      pipeline.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("jobs")}
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25 active:translate-y-0"
                  >
                    <Plus className="h-4 w-4" />
                    Create new job
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </section>

              {/* Stats */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={BriefcaseBusiness}
                  label="Active jobs"
                  value={jobs.length}
                  detail="Screening pipelines"
                />

                <StatCard
                  icon={Users}
                  label="Candidates"
                  value={candidates.length}
                  detail={activeJob ? activeJob.title : "Select a job"}
                />

                <StatCard
                  icon={BarChart3}
                  label="Average match"
                  value={candidates.length ? `${averageScore}%` : "—"}
                  detail="Current pipeline"
                />

                <StatCard
                  icon={Layers3}
                  label="Shortlisted"
                  value={shortlisted}
                  detail="80%+ match score"
                />
              </section>

              {/* Main content */}
              <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
                {/* Leaderboard */}
                <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-extrabold text-slate-950">
                          Candidate leaderboard
                        </h3>

                        {candidates.length > 0 && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                            {candidates.length}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        AI-ranked candidates for the selected role.
                      </p>
                    </div>

                    <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 sm:w-56">
                      <Search className="h-4 w-4 shrink-0 text-slate-400" />

                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search candidates..."
                        className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <Leaderboard
                      candidates={filteredCandidates}
                      onSelectCandidate={setActiveCandidate}
                      onCompareCandidates={setComparingIds}
                    />
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                  {/* Active pipeline */}
                  <div className="relative overflow-hidden rounded-[22px] bg-[#111827] p-6 text-white shadow-xl shadow-slate-900/10">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />

                    <div className="relative">
                      <div className="mb-5 flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                          <Sparkles className="h-5 w-5" />
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Active
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold">
                        Active screening pipeline
                      </h3>

                      {activeJob ? (
                        <>
                          <p className="mt-2 text-sm font-bold text-slate-200">
                            {activeJob.title}
                          </p>

                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">
                            {activeJob.description}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {activeJob.requirements
                              ?.slice(0, 4)
                              .map((req, index) => (
                                <span
                                  key={index}
                                  className="rounded-md bg-white/[0.06] px-2 py-1 text-[9px] font-semibold text-slate-400"
                                >
                                  {req}
                                </span>
                              ))}
                          </div>

                          <button
                            onClick={() => navigate("upload")}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-slate-900 transition hover:bg-indigo-50"
                          >
                            Upload resumes
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            Create your first job pipeline to start screening
                            candidates.
                          </p>

                          <button
                            onClick={() => navigate("jobs")}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-xs font-bold transition hover:bg-indigo-400"
                          >
                            Create job
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recent jobs */}
                  <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Recent jobs
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Your latest screening pipelines
                        </p>
                      </div>

                      <button
                        onClick={() => navigate("jobs")}
                        className="text-[10px] font-bold text-indigo-600 transition hover:text-indigo-700"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-2">
                      {jobs.slice(0, 4).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => setActiveJob(job)}
                          className={`group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                            activeJob?.id === job.id
                              ? "border-indigo-200 bg-indigo-50"
                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                activeJob?.id === job.id
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              <BriefcaseBusiness className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800">
                                {job.title}
                              </p>

                              <p className="mt-1 text-[9px] text-slate-400">
                                {new Date(
                                  job.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                        </button>
                      ))}

                      {!jobs.length && (
                        <div className="rounded-xl bg-slate-50 p-6 text-center">
                          <BriefcaseBusiness className="mx-auto h-5 w-5 text-slate-300" />
                          <p className="mt-2 text-[10px] font-semibold text-slate-400">
                            No jobs created yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* JOBS */}
          {view === "jobs" && (
  <section className="space-y-6">
    {/* Page Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Recruitment workspace
        </p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
          Job Pipelines
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Create and manage hiring pipelines. Each pipeline can have its own
          requirements and screened candidates.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <BriefcaseBusiness className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-bold text-slate-700">
          {jobs.length} {jobs.length === 1 ? "Pipeline" : "Pipelines"}
        </span>
      </div>
    </div>

    {/* Main Grid */}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      
      {/* Create Job */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Plus className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Create a new pipeline
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Define the role and requirements before screening resumes.
            </p>
          </div>
        </div>

        <JobInput
          onJobCreated={handleJobCreated}
          activeJob={activeJob}
        />
      </div>

      {/* Existing Pipelines */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Your pipelines
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Select a pipeline to continue screening.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Layers3 className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="p-4">
          {jobs.length > 0 ? (
            <div className="space-y-2">
              {jobs.map((job) => {
                const isActive = activeJob?.id === job.id;

                return (
                  <div
                    key={job.id}
                    className={`group rounded-xl border p-3 transition ${
                      isActive
                        ? "border-indigo-200 bg-indigo-50/70"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      
                      {/* Job Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>

                      {/* Job Info */}
                      <button
                        onClick={() => {
                          setActiveJob(job);
                          setView("dashboard");
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {job.title}
                          </p>

                          {isActive && (
                            <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                          <span>
                            {job.requirements?.length || 0} requirements
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                        title="Delete pipeline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Active Pipeline Action */}
                    {isActive && (
                      <button
                        onClick={() => setView("upload")}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Screen resumes
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <h4 className="mt-4 text-sm font-bold text-slate-700">
                No pipelines yet
              </h4>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
                Create your first job pipeline to start screening candidates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Bottom Info Cards */}
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <BriefcaseBusiness className="h-4 w-4" />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-800">
          Create a role
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Add the job title, description and required skills.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Upload className="h-4 w-4" />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-800">
          Upload resumes
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Upload candidate resumes for the selected pipeline.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <BarChart3 className="h-4 w-4" />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-800">
          Review candidates
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Let the existing AI scoring pipeline rank candidates.
        </p>
      </div>
    </div>
  </section>
)}

          {/* UPLOAD */}
          {view === "upload" && (
  <section className="space-y-6">
    {/* Page Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Candidate screening
        </p>

        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
          Screen Resumes
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Upload candidate resumes and let the existing AI pipeline extract,
          score and rank them against your selected job.
        </p>
      </div>

      {activeJob && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <FileText className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-bold text-slate-700">
            Ready to screen
          </span>
        </div>
      )}
    </div>

    {activeJob ? (
      <div className="space-y-6">
        {/* Active Job */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  Screening for
                </p>

                <p className="mt-1 text-base font-bold text-slate-900">
                  {activeJob.title}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {activeJob.requirements?.length || 0} required skills
                </p>
              </div>
            </div>

            <select
              value={activeJob.id}
              onChange={(e) =>
                setActiveJob(
                  jobs.find((j) => j.id === Number(e.target.value)) || null
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Area */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Upload className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload candidate resumes
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Upload PDF, DOCX, DOC or TXT files. The existing screening
                pipeline will process them automatically.
              </p>
            </div>
          </div>

          <UploadZone
            activeJobId={activeJob.id}
            onCandidatesProcessed={handleCandidatesProcessed}
          />
        </div>

        {/* How it works */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              How screening works
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Your existing backend handles the complete processing flow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Upload className="h-4 w-4" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                1. Upload
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Add one or multiple candidate resumes to the selected job.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <FileText className="h-4 w-4" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                2. Analyze
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Resume content is parsed and relevant candidate information is
                extracted.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <BarChart3 className="h-4 w-4" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                3. Rank
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Candidates are scored against the requirements of the selected
                role.
              </p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      /* No Active Job */
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
          <BriefcaseBusiness className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-base font-bold text-slate-800">
          No active job pipeline
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          Create a job pipeline first, then return here to upload and screen
          candidate resumes.
        </p>

        <button
          onClick={() => setView("jobs")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create job pipeline
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )}
  </section>
)}
        </main>
      </div>

      {/* Candidate detail */}
    {activeCandidate && (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f8fc] p-5 sm:p-8">
    <div className="mx-auto max-w-[1200px]">
      <CandidateDetail
        candidate={activeCandidate}
        onBack={() => setActiveCandidate(null)}
      />
    </div>
  </div>
)}
      {/* Comparison */}
      {comparingIds && activeJob && (
        <ComparisonMatrix
          jobId={activeJob.id}
          candidateIds={comparingIds}
          onClose={() => setComparingIds(null)}
        />
      )}
    </div>
  );
}

/* -----------------------------
   Reusable UI
------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="group rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>

        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-emerald-600">
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <p className="mt-5 text-[27px] font-black tracking-[-0.03em] text-slate-950">
        {value}
      </p>

      <p className="mt-0.5 text-xs font-bold text-slate-700">{label}</p>

      <p className="mt-1 truncate text-[10px] text-slate-400">{detail}</p>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
        {eyebrow}
      </p>

      <h2 className="text-3xl font-black tracking-[-0.035em] text-slate-950">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ProcessCard({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: string;
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-slate-300">
              {number}
            </span>

            <p className="text-xs font-extrabold text-slate-800">{title}</p>
          </div>

          <p className="mt-0.5 text-[9px] text-slate-400">{text}</p>
        </div>
      </div>
    </div>
  );
}