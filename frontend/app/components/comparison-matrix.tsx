"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Brain,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { API_BASE } from "../config";

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

interface ComparisonMatrixProps {
  jobId: number;
  candidateIds: number[];
  onClose: () => void;
}

export default function ComparisonMatrix({
  jobId,
  candidateIds,
  onClose,
}: ComparisonMatrixProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparisonData() {
      try {
        setLoading(true);

        const idsParam = candidateIds.join(",");

        const response = await fetch(
          `${API_BASE}/api/jobs/${jobId}/compare?ids=${idsParam}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch comparison details");
        }

        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error(error);
        alert("Could not load candidate comparison details.");
      } finally {
        setLoading(false);
      }
    }

    if (candidateIds.length > 0) {
      fetchComparisonData();
    }
  }, [jobId, candidateIds]);

  const getScoreStyle = (score: number) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

      {/* BACKDROP */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Scale className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Candidate Comparison
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Side-by-side comparison of selected candidates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading comparison...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Fetching candidate screening data
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Scale className="h-10 w-10 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No comparison data available
            </p>

            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        ) : (
          /* CONTENT */
          <div className="flex-1 overflow-auto bg-slate-50/50 p-5">

            {/* CANDIDATE CARDS */}
            <div
              className={`grid gap-4 ${
                candidates.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {candidates.map((candidate, index) => {
                const style = getScoreStyle(candidate.score);

                return (
                  <div
                    key={candidate.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* PROFILE */}
                    <div className="border-b border-slate-100 p-5">

                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Candidate #{index + 1}
                        </span>

                        {index === 0 && (
                          <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                            <Award className="h-3 w-3" />
                            Top Match
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                          {candidate.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-slate-900">
                            {candidate.name}
                          </h3>

                          {candidate.email && (
                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              {candidate.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* SCORE */}
                      <div
                        className={`mt-5 rounded-xl border ${style.border} ${style.bg} p-4`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Overall Match
                          </span>

                          <span
                            className={`text-2xl font-extrabold ${style.text}`}
                          >
                            {candidate.score.toFixed(1)}%
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className={`h-full rounded-full ${style.bar}`}
                            style={{
                              width: `${Math.min(
                                candidate.score,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SCORE BREAKDOWN */}
                    <div className="space-y-4 border-b border-slate-100 p-5">

                      <ScoreRow
                        label="Technical Skills"
                        score={candidate.technical_score}
                        icon={<Brain className="h-4 w-4" />}
                      />

                      <ScoreRow
                        label="Experience"
                        score={candidate.experience_score}
                        icon={<Briefcase className="h-4 w-4" />}
                      />

                      <ScoreRow
                        label="Education"
                        score={candidate.education_score}
                        icon={<GraduationCap className="h-4 w-4" />}
                      />

                    </div>

                    {/* EXPERIENCE */}
                    <div className="border-b border-slate-100 p-5">

                      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Experience
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {candidate.experience.years}{" "}
                            {candidate.experience.years === 1
                              ? "Year"
                              : "Years"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {candidate.experience.roles?.[0] ||
                              "No role listed"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SKILLS */}
                    <div className="border-b border-slate-100 p-5">

                      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Skills
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.length > 0 ? (
                          candidate.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            No skills extracted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* EDUCATION */}
                    <div className="border-b border-slate-100 p-5">

                      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Education
                      </p>

                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                          <GraduationCap className="h-4 w-4 text-amber-600" />
                        </div>

                        <p className="text-xs leading-5 text-slate-600">
                          {candidate.education ||
                            "No education details extracted."}
                        </p>
                      </div>
                    </div>

                    {/* SUMMARY */}
                    <div className="p-5">

                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600" />

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          AI Summary
                        </p>
                      </div>

                      <p className="text-xs leading-6 text-slate-500">
                        {candidate.summary ||
                          "No candidate summary available."}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* MATRIX */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-600" />

                  <h3 className="text-sm font-bold text-slate-900">
                    Score Comparison
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Criteria
                      </th>

                      {candidates.map((candidate) => (
                        <th
                          key={candidate.id}
                          className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400"
                        >
                          {candidate.name}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>

                    <ComparisonRow
                      label="Overall Match"
                      candidates={candidates}
                      getValue={(candidate) => candidate.score}
                    />

                    <ComparisonRow
                      label="Technical Score"
                      candidates={candidates}
                      getValue={(candidate) =>
                        candidate.technical_score
                      }
                    />

                    <ComparisonRow
                      label="Experience Score"
                      candidates={candidates}
                      getValue={(candidate) =>
                        candidate.experience_score
                      }
                    />

                    <ComparisonRow
                      label="Education Score"
                      candidates={candidates}
                      getValue={(candidate) =>
                        candidate.education_score
                      }
                    />

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-3">

          <p className="text-xs text-slate-400">
            Comparison generated from the selected job screening results.
          </p>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
}


/* SCORE ROW */

function ScoreRow({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
}) {
  const bar =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-rose-500";

  const text =
    score >= 80
      ? "text-emerald-600"
      : score >= 50
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <div>
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          {icon}
          {label}
        </div>

        <span className={`text-xs font-bold ${text}`}>
          {score.toFixed(1)}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{
            width: `${Math.min(score, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}


/* COMPARISON TABLE ROW */

function ComparisonRow({
  label,
  candidates,
  getValue,
}: {
  label: string;
  candidates: Candidate[];
  getValue: (candidate: Candidate) => number;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">

      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
        {label}
      </td>

      {candidates.map((candidate) => {
        const value = getValue(candidate);

        const text =
          value >= 80
            ? "text-emerald-600"
            : value >= 50
              ? "text-amber-600"
              : "text-rose-600";

        return (
          <td
            key={candidate.id}
            className="px-5 py-4"
          >
            <span className={`text-sm font-bold ${text}`}>
              {value.toFixed(1)}%
            </span>
          </td>
        );
      })}
    </tr>
  );
}