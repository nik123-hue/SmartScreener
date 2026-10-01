"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // Frontend-only login for now.
    // Existing backend/authentication remains untouched.
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left branding section */}
        <section className="relative hidden overflow-hidden bg-[#111827] lg:flex">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold tracking-tight text-white">
                  SmartScreener
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  AI Recruiting
                </p>
              </div>
            </div>

            <div className="max-w-lg">
              <p className="mb-3 text-sm font-semibold text-indigo-400">
                AI-powered recruitment
              </p>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
                Find the right candidate,
                <span className="text-indigo-400"> faster.</span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                Screen resumes, compare candidates and identify the strongest
                matches using your existing AI scoring pipeline.
              </p>

              <div className="mt-8 flex items-center gap-3 text-xs font-medium text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Secure candidate screening workspace
              </div>
            </div>

            <p className="text-xs text-slate-500">
              SmartScreener · AI Recruiting Platform
            </p>
          </div>
        </section>

        {/* Login section */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-extrabold">SmartScreener</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  AI Recruiting
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-indigo-600">
                Welcome back
              </p>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                Sign in to your workspace
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Continue managing your candidate screening pipelines.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  Email address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30"
              >
                Sign in
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                SmartScreener
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-xs leading-5 text-slate-400">
              Demo authentication is enabled for the frontend.
              <br />
              Your existing backend remains unchanged.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}