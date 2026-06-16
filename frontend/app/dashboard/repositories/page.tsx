"use client";

import React, { useState } from "react";
import { 
  GitBranch, 
  Terminal, 
  ShieldAlert, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Search,
  UploadCloud,
  Layers
} from "lucide-react";

interface Issue {
  id: number;
  type: "security" | "smell" | "documentation";
  severity: "high" | "medium" | "low";
  file: string;
  line: number;
  message: string;
  fix: string;
}

export default function RepositoriesPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [hasData, setHasData] = useState(true);

  const analysisSteps = [
    "Cloning repository & reading files...",
    "Chunking code contents into semantic blocks...",
    "Generating vectors using BAAI/bge-small-en-v1.5...",
    "Upserting embeddings to Qdrant vector database...",
    "Calculating complexity and dependency risks..."
  ];

  const issues: Issue[] = [
    {
      id: 1,
      type: "security",
      severity: "high",
      file: "config.py",
      line: 42,
      message: "Hardcoded API Access Token placeholder string found in static dictionary.",
      fix: "Load token from system environment variable using os.getenv()."
    },
    {
      id: 2,
      type: "security",
      severity: "medium",
      file: "app/db.py",
      line: 15,
      message: "SQL Injection risk: Raw string interpolation detected in query execute.",
      fix: "Use parameterized queries or SQLAlchemy bind parameters."
    },
    {
      id: 3,
      type: "smell",
      severity: "medium",
      file: "services/analyzer.py",
      line: 112,
      message: "High cognitive complexity: Function 'calculate_metrics' has score 22 (max suggested: 15).",
      fix: "Refactor nested conditions into helper functions."
    },
    {
      id: 4,
      type: "documentation",
      severity: "low",
      file: "app/main.py",
      line: 1,
      message: "Missing module-level docstring in API router entry point.",
      fix: "Add PEP 257 docstring explaining module routes."
    }
  ];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Simulate steps
    const interval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsAnalyzing(false);
          setHasData(true);
          return 0;
        }
      });
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Repository Analysis</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Analyze repository health, count smells, verify dependencies, and create RAG embeddings.
        </p>
      </div>

      {/* Input Form & Drag-Drop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-border/60 space-y-6">
          <h2 className="text-lg font-bold">Index a New Repository</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                GitHub Repository URL
              </label>
              <div className="flex gap-3">
                <div className="relative flex-grow">
                  <GitBranch className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="https://github.com/username/repository"
                    className="w-full text-sm bg-muted/40 border border-border rounded-xl pl-9 pr-4 py-3 outline-none focus:border-primary/50 text-foreground"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing || !repoUrl}
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm whitespace-nowrap"
                >
                  {isAnalyzing ? "Analyzing..." : "Start Scan"}
                </button>
              </div>
            </div>
          </form>

          {/* Separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/40"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground">OR</span>
            <div className="flex-grow border-t border-border/40"></div>
          </div>

          {/* Drag & Drop mockup */}
          <div className="border border-dashed border-border/80 hover:border-primary/40 rounded-2xl p-8 text-center bg-muted/10 cursor-pointer transition-all duration-300">
            <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-bold text-sm">Upload Local Repository Folder</h4>
            <p className="text-xs text-muted-foreground mt-1">Drag and drop folder, or browse files (Max 50MB)</p>
          </div>
        </div>

        {/* Sidebar Info - Status Panel */}
        <div className="glass-card rounded-2xl p-6 border border-border/60 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm mb-3">Model Configuration</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Embedding model:</span>
                <span className="font-mono text-primary">bge-small-en-v1.5</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Vector database:</span>
                <span className="font-mono text-primary">Qdrant Cloud</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Local LLM model:</span>
                <span className="font-mono text-purple-500">Qwen2.5-Coder (7B)</span>
              </div>
            </div>
          </div>

          {/* Loader status */}
          {isAnalyzing && (
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Indexing in Progress</span>
              </div>
              <p className="text-xs text-foreground font-semibold leading-relaxed">
                {analysisSteps[analysisStep]}
              </p>
              <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-1.5 transition-all duration-500" 
                  style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {!isAnalyzing && (
            <div className="text-xs text-muted-foreground leading-relaxed mt-6">
              Ready to scan. Indexing uploads codebase structure to the Qdrant DB to power the RAG chat and search assistant.
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results Display */}
      {hasData && !isAnalyzing && (
        <div className="space-y-8">
          {/* Health Metrics & Coverage Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Health Score circle meter */}
            <div className="glass-card rounded-2xl p-6 border border-border/60 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Repository Health</span>
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="var(--color-border)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="var(--color-primary)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * 85) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold">85</span>
                  <span className="text-[10px] text-muted-foreground font-bold">OUT OF 100</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Grade: Stable & Clean
              </span>
            </div>

            {/* Coverage Meters */}
            <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4 md:col-span-2 justify-center flex flex-col">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Coverage Metrics</span>
              
              <div className="space-y-4">
                {/* Documentation coverage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-blue-500" /> Documentation Coverage</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }} />
                  </div>
                </div>

                {/* Test coverage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unit Test Coverage</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>

                {/* Duplication score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-amber-500" /> Code Duplication Rate</span>
                    <span>8%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "8%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* List of Detected Issues */}
          <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-6">
            <div className="flex justify-between items-center border-b border-border/40 pb-4">
              <h3 className="font-bold text-lg">Detected Code smells and Vulnerabilities</h3>
              <span className="text-xs font-mono text-muted-foreground">{issues.length} items found</span>
            </div>

            <div className="space-y-4">
              {issues.map((issue) => (
                <div 
                  key={issue.id} 
                  className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-start gap-4 transition-all duration-200 ${
                    issue.severity === "high" 
                      ? "bg-rose-500/5 border-rose-500/20" 
                      : issue.severity === "medium" 
                        ? "bg-amber-500/5 border-amber-500/20" 
                        : "bg-blue-500/5 border-blue-500/20"
                  }`}
                >
                  {/* Warning Symbol */}
                  <div className="shrink-0 mt-0.5">
                    {issue.severity === "high" ? (
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${issue.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1.5 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold font-mono text-xs bg-muted px-2 py-0.5 rounded border border-border">
                        {issue.file}:{issue.line}
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        issue.severity === "high" 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/15" 
                          : issue.severity === "medium" 
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/15" 
                            : "bg-blue-500/10 text-blue-500 border-blue-500/15"
                      }`}>
                        {issue.severity} severity
                      </span>
                      <span className="text-xs font-bold text-muted-foreground capitalize">
                        {issue.type}
                      </span>
                    </div>

                    <p className="text-foreground font-semibold leading-relaxed">
                      {issue.message}
                    </p>

                    <div className="pt-1.5 flex gap-1.5 items-start text-xs text-muted-foreground leading-relaxed">
                      <span className="font-bold text-primary shrink-0">Recommendation:</span>
                      <span>{issue.fix}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
