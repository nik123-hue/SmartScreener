"use client";

import React, { useState } from "react";
import { Briefcase, Sparkles, FileText, CheckCircle } from "lucide-react";
import { API_BASE } from "../config";

interface JobInputProps {
  onJobCreated: (job: any) => void;
  activeJob: any;
}

const TEMPLATES = [
  {
    title: "Senior Full-Stack Engineer",
    description:
      "We are looking for a Senior Full-Stack Engineer to build scalable web applications. Required skills: Python, React, Next.js, FastAPI, Docker, and PostgreSQL. Candidates must have 5+ years of experience, design robust microservices, and lead technical architectures. Bachelor's or Master's degree in CS preferred.",
  },
  {
    title: "AI / Data Scientist",
    description:
      "Seeking a Data Scientist to build and deploy predictive ML models. Required skills: Python, SQL, Machine Learning, Deep Learning, PyTorch, Scikit-Learn, and NLP. Experience with Large Language Models (LLMs) and data visualization tools is a big plus. 3+ years of experience required.",
  },
  {
    title: "Technical Product Manager",
    description:
      "We are hiring a Technical Product Manager to oversee SaaS platform growth. Required skills: Agile, Scrum, Product Management, Jira, Roadmap planning, and system design concepts. You will collaborate with engineering teams to scope features and define product specifications. 4+ years of experience.",
  },
];

export default function JobInput({
  onJobCreated,
  activeJob,
}: JobInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setMessage(`Applied "${template.title}" template.`);

    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create job description.");
      }

      const job = await response.json();

      onJobCreated(job);

      setTitle("");
      setDescription("");

      setMessage("Job Description established successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      alert(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Briefcase className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Job Specification
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create a role and define what you're looking for.
          </p>
        </div>
      </div>

      {/* Templates */}
      <div className="mb-6 mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quick templates
        </p>

        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role Title */}
        <div>
          <label
            htmlFor="job-title"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Role Title
          </label>

          <input
            id="job-title"
            type="text"
            required
            placeholder="e.g. Lead AI Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="job-desc"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Description & Core Requirements
          </label>

          <textarea
            id="job-desc"
            required
            rows={6}
            placeholder="Describe responsibilities, skills, technologies and experience..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Create Screening Pipeline
            </>
          )}
        </button>
      </form>

      {/* Success message */}
      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          {message}
        </div>
      )}

      {/* Active Job */}
      {activeJob && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Active Job Profile
          </span>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {activeJob.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {activeJob.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {activeJob.requirements.map(
              (req: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {req}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}