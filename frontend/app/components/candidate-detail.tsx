"use client";

import React from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Brain,
  CheckCircle2,
  Award,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";

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

interface CandidateDetailProps {
  candidate: Candidate;
  onBack: () => void;
}

export default function CandidateDetail({
  candidate,
  onBack,
}: CandidateDetailProps) {
    if (!candidate) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800">
            Candidate not found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Please return to the candidate leaderboard.
          </p>

          <button
            onClick={onBack}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }
  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        bar: "bg-emerald-500",
      };
    }

    if (score >= 50) {
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        bar: "bg-amber-500",
      };
    }

    return {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      bar: "bg-rose-500",
    };
  };

  const scoreStyle = getScoreColor(candidate.score);

  const scoreCards = [
    {
      title: "Technical Skills",
      score: candidate.technical_score,
      icon: Brain,
    },
    {
      title: "Experience",
      score: candidate.experience_score,
      icon: Briefcase,
    },
    {
      title: "Education",
      score: candidate.education_score,
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-6">

      {/* TOP BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Candidates
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Resume Screened
        </div>
      </div>

      {/* CANDIDATE HEADER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-indigo-50 via-white to-white px-6 py-7 sm:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-sm">
                {candidate.name
                  ? candidate.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "C"}
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Candidate Profile
                </p>

                <h1 className="text-2xl font-bold text-slate-900">
                  {candidate.name}
                </h1>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                  {candidate.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {candidate.email}
                    </span>
                  )}

                  {candidate.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {candidate.phone}
                    </span>
                  )}

                </div>
              </div>
            </div>

            {/* OVERALL SCORE */}
            <div
              className={`rounded-2xl border ${scoreStyle.border} ${scoreStyle.bg} px-7 py-5 text-center`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overall Match
              </p>

              <p
                className={`mt-1 text-4xl font-extrabold ${scoreStyle.text}`}
              >
                {candidate.score.toFixed(1)}%
              </p>

              <p className={`mt-1 text-xs font-bold ${scoreStyle.text}`}>
                AI Compatibility Score
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* SCORE BREAKDOWN */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />

          <h2 className="text-base font-bold text-slate-900">
            Match Breakdown
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {scoreCards.map((item) => {
            const Icon = item.icon;
            const style = getScoreColor(item.score);

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {item.title}
                    </span>
                  </div>

                  <span className={`text-lg font-bold ${style.text}`}>
                    {item.score.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${style.bar}`}
                    style={{
                      width: `${Math.min(item.score, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">

          {/* AI SUMMARY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  AI Candidate Summary
                </h2>

                <p className="text-xs text-slate-500">
                  Extracted from the submitted resume
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm leading-7 text-slate-600">
                {candidate.summary ||
                  "No candidate summary was extracted from this resume."}
              </p>
            </div>
          </section>

          {/* EXPERIENCE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Professional Experience
                </h2>

                <p className="text-xs text-slate-500">
                  Candidate's extracted work experience
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="rounded-xl border border-slate-100 p-4">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Total Experience
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {candidate.experience.roles.length > 0
                        ? candidate.experience.roles.join(", ")
                        : "No specific role extracted"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-indigo-50 px-4 py-2 text-center">
                    <p className="text-xl font-bold text-indigo-700">
                      {candidate.experience.years}
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                      Years
                    </p>
                  </div>
                </div>

                {candidate.experience.companies.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Companies
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {candidate.experience.companies.map(
                        (company, index) => (
                          <span
                            key={index}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                          >
                            {company}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* RESUME TEXT */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Resume Content
                </h2>

                <p className="text-xs text-slate-500">
                  Parsed text from the uploaded document
                </p>
              </div>
            </div>

            <div className="mt-5 max-h-[420px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {candidate.resume_text ||
                  "No parsed resume text is available."}
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* SKILLS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <Award className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Extracted Skills
                </h2>

                <p className="text-xs text-slate-500">
                  Skills detected from resume
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {candidate.skills.length > 0 ? (
                candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No skills extracted.
                </p>
              )}
            </div>
          </section>

          {/* EDUCATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <GraduationCap className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Education
                </h2>

                <p className="text-xs text-slate-500">
                  Academic information
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-medium leading-6 text-slate-700">
                {candidate.education ||
                  "No education details extracted."}
              </p>
            </div>
          </section>

          {/* PROFILE INFO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <User className="h-5 w-5 text-slate-600" />
              </div>

              <h2 className="text-base font-bold text-slate-900">
                Profile Information
              </h2>
            </div>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Candidate ID
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  #{candidate.id}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Job ID
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  #{candidate.job_id}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Screening Status
                </p>

                <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}