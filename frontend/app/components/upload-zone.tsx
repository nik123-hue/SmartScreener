"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle, RefreshCcw } from "lucide-react";
import { API_BASE } from "../config";

interface UploadZoneProps {
  activeJobId: number | null;
  onCandidatesProcessed: (candidates: any[]) => void;
}

interface UploadingFile {
  name: string;
  size: number;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
}

export default function UploadZone({ activeJobId, onCandidatesProcessed }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const triggerInputClick = () => {
    if (!activeJobId) return;
    fileInputRef.current?.click();
  };

  const processFiles = async (fileList: FileList) => {
    if (!activeJobId) return;

    // Filter valid files
    const validExtensions = ["pdf", "docx", "doc", "txt"];
    const uploadList: UploadingFile[] = [];
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (validExtensions.includes(ext)) {
        uploadList.push({
          name: f.name,
          size: f.size,
          status: "uploading",
          progress: 30,
        });
        validFiles.push(f);
      } else {
        uploadList.push({
          name: f.name,
          size: f.size,
          status: "error",
          progress: 0,
        });
      }
    }

    setFiles(uploadList);
    if (validFiles.length === 0) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      validFiles.forEach((f) => {
        formData.append("files", f);
      });

      // Update progress slightly for UI feel
      setFiles((prev) =>
        prev.map((item) => (item.status === "uploading" ? { ...item, progress: 60 } : item))
      );

      const response = await fetch(`${API_BASE}/api/jobs/${activeJobId}/resumes`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Resume processing failed.");
      }

      const results = await response.json();
      
      setFiles((prev) =>
        prev.map((item) =>
          item.status === "uploading" ? { ...item, status: "success", progress: 100 } : item
        )
      );

      // Trigger callback to update leaderboard
      onCandidatesProcessed(results);
    } catch (err) {
      setFiles((prev) =>
        prev.map((item) => (item.status === "uploading" ? { ...item, status: "error" } : item))
      );
      console.error(err);
    } finally {
      setIsProcessing(false);
      // Clear logs after a few seconds
      setTimeout(() => {
        setFiles([]);
      }, 5000);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Upload Candidates</h2>
        {!activeJobId && (
          <span className="flex items-center gap-1 text-xs text-amber-500 font-medium animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            Establish job profile first
          </span>
        )}
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 px-6 text-center transition-all ${
          !activeJobId
            ? "cursor-not-allowed border-zinc-200 bg-zinc-50/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/20"
            : isDragActive
            ? "border-indigo-500 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/10 scale-[1.01]"
            : "cursor-pointer border-zinc-200 bg-zinc-50/20 hover:border-indigo-400 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/10 dark:hover:border-indigo-500 dark:hover:bg-zinc-900/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={!activeJobId}
        />

        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition ${
          isDragActive ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}>
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Drag & drop candidate resumes here
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Supports multiple PDF, DOCX, DOC, or TXT profiles
        </p>
      </div>

      {/* Uploading Progress List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Processing Logs
          </span>
          <div className="space-y-2.5">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <File className={`h-4.5 w-4.5 shrink-0 ${file.status === "error" ? "text-rose-500" : "text-indigo-500"}`} />
                    <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-[10px] text-zinc-400 font-mono">
                      ({formatSize(file.size)})
                    </span>
                  </div>
                  <div className="shrink-0 font-medium">
                    {file.status === "uploading" && (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <RefreshCcw className="h-3 w-3 animate-spin" />
                        Parsing...
                      </span>
                    )}
                    {file.status === "success" && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Scored
                      </span>
                    )}
                    {file.status === "error" && (
                      <span className="flex items-center gap-1 text-rose-500">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {file.status === "uploading" && (
                  <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500 dark:bg-indigo-500"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elegant Skeleton State during processing */}
      {isProcessing && (
        <div className="mt-4 animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-2">
              <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-2 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
}
