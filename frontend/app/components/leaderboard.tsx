"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  Mail,
  Phone,
  Layers,
  Scale,
  Eye,
  Check,
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

interface LeaderboardProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onCompareCandidates: (selectedIds: number[]) => void;
}

export default function Leaderboard({
  candidates,
  onSelectCandidate,
  onCompareCandidates,
}: LeaderboardProps) {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "experience">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectCompare = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      if (prev.length >= 3) {
        alert("You can compare a maximum of 3 candidates at a time.");
        return prev;
      }

      return [...prev, id];
    });
  };

  const handleSortToggle = (field: "score" | "experience") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();

    candidates.forEach((candidate) => {
      candidate.skills.forEach((skill) => skillSet.add(skill));
    });

    return Array.from(skillSet).sort();
  }, [candidates]);

  const processedCandidates = useMemo(() => {
    return candidates
      .filter((candidate) => {
        const query = search.toLowerCase().trim();

        const matchesSearch =
          !query ||
          candidate.name.toLowerCase().includes(query) ||
          (candidate.email &&
            candidate.email.toLowerCase().includes(query));

        const matchesSkill =
          !skillFilter ||
          candidate.skills.some(
            (skill) => skill.toLowerCase() === skillFilter.toLowerCase()
          );

        return matchesSearch && matchesSkill;
      })
      .sort((a, b) => {
        const valueA =
          sortBy === "score" ? a.score : a.experience.years;

        const valueB =
          sortBy === "score" ? b.score : b.experience.years;

        return sortOrder === "desc"
          ? valueB - valueA
          : valueA - valueB;
      });
  }, [
    candidates,
    search,
    skillFilter,
    sortBy,
    sortOrder,
  ]);

  const getScoreStyle = (score: number) => {
    if (score >= 80) {
      return {
        wrapper:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        bar: "bg-emerald-500",
        label: "Strong Match",
      };
    }

    if (score >= 50) {
      return {
        wrapper:
          "border-amber-200 bg-amber-50 text-amber-700",
        bar: "bg-amber-500",
        label: "Moderate Match",
      };
    }

    return {
      wrapper:
        "border-rose-200 bg-rose-50 text-rose-700",
      bar: "bg-rose-500",
      label: "Low Match",
    };
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Ranking Leaderboard
                <span className="ml-2 text-indigo-600">
                  ({processedCandidates.length})
                </span>
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                AI-ranked candidates based on role requirements
              </p>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-wrap items-center gap-2">

            {selectedIds.length >= 2 && (
              <button
                onClick={() =>
                  onCompareCandidates(selectedIds)
                }
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Scale className="h-4 w-4" />
                Compare ({selectedIds.length})
              </button>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* Skills */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-40 appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">All Skills</option>

                {allSkills.map((skill, index) => (
                  <option key={index} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {processedCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Layers className="h-7 w-7 text-slate-400" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            No candidates found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Upload resumes or adjust your search/filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">

          {/* TABLE */}
          <table className="w-full min-w-[1050px] border-collapse text-left">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">

                <th className="w-14 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Compare
                </th>

                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Candidate
                </th>

                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <button
                    onClick={() =>
                      handleSortToggle("score")
                    }
                    className="flex items-center gap-1.5 transition hover:text-indigo-600"
                  >
                    Match Score
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>

                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <button
                    onClick={() =>
                      handleSortToggle("experience")
                    }
                    className="flex items-center gap-1.5 transition hover:text-indigo-600"
                  >
                    Experience
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>

                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Top Skills
                </th>

                <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {processedCandidates.map((candidate, index) => {
                const scoreStyle = getScoreStyle(
                  candidate.score
                );

                return (
                  <tr
                    key={candidate.id}
                    className="group border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                  >

                    {/* COMPARE */}
                    <td className="px-5 py-5 text-center">
                      <label className="relative inline-flex cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            candidate.id
                          )}
                          onChange={() =>
                            handleSelectCompare(candidate.id)
                          }
                          className="peer sr-only"
                        />

                        <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 bg-white transition peer-checked:border-indigo-600 peer-checked:bg-indigo-600">
                          {selectedIds.includes(
                            candidate.id
                          ) && (
                            <Check className="h-3.5 w-3.5 text-white" />
                          )}
                        </span>
                      </label>
                    </td>

                    {/* CANDIDATE */}
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">

                        {/* Rank */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                          #{index + 1}
                        </div>

                        <div className="min-w-0">
                          <button
                            onClick={() =>
                              onSelectCandidate(candidate)
                            }
                            className="text-left text-sm font-bold text-slate-900 transition hover:text-indigo-600"
                          >
                            {candidate.name}
                          </button>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">

                            {candidate.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                {candidate.email}
                              </span>
                            )}

                            {candidate.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {candidate.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SCORE */}
                    <td className="px-4 py-5">
                      <div className="w-32">

                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${scoreStyle.wrapper}`}
                          >
                            {candidate.score.toFixed(1)}%
                          </span>

                          <span className="text-[10px] font-medium text-slate-400">
                            {scoreStyle.label}
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${scoreStyle.bar}`}
                            style={{
                              width: `${Math.min(
                                candidate.score,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* EXPERIENCE */}
                    <td className="px-4 py-5">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {candidate.experience.years}{" "}
                          {candidate.experience.years === 1
                            ? "Year"
                            : "Years"}
                        </p>

                        <p className="mt-1 max-w-[150px] truncate text-xs text-slate-500">
                          {candidate.experience.roles
                            .join(", ") ||
                            "No role listed"}
                        </p>
                      </div>
                    </td>

                    {/* SKILLS */}
                    <td className="px-4 py-5">
                      <div className="flex max-w-[300px] flex-wrap gap-1.5">

                        {candidate.skills
                          .slice(0, 5)
                          .map((skill, skillIndex) => {
                            const active =
                              skillFilter.toLowerCase() ===
                              skill.toLowerCase();

                            return (
                              <button
                                key={skillIndex}
                                onClick={() =>
                                  setSkillFilter(
                                    active ? "" : skill
                                  )
                                }
                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                                  active
                                    ? "border-indigo-200 bg-indigo-100 text-indigo-700"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}

                        {candidate.skills.length > 5 && (
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            +{candidate.skills.length - 5} more
                          </span>
                        )}

                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-5 text-right">
                      <button
                        onClick={() =>
                          onSelectCandidate(candidate)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Report
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER */}
      {processedCandidates.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing{" "}
            <strong className="text-slate-700">
              {processedCandidates.length}
            </strong>{" "}
            candidate
            {processedCandidates.length !== 1
              ? "s"
              : ""}
          </span>

          {selectedIds.length > 0 && (
            <span className="font-medium text-indigo-600">
              {selectedIds.length} selected for comparison
            </span>
          )}
        </div>
      )}
    </div>
  );
}