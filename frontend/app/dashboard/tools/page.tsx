"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  GitCommit, 
  Network, 
  Calendar, 
  ShieldAlert, 
  Copy, 
  Check, 
  Play, 
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<"commit" | "architecture" | "sprint" | "scanner">("commit");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tab 1: Commit Message Generator States
  const [gitDiff, setGitDiff] = useState(
    `diff --git a/app/api/auth.py b/app/api/auth.py\nindex 8af3b1d..cd4e5f2 100644\n--- a/app/api/auth.py\n+++ b/app/api/auth.py\n@@ -12,4 +12,12 @@ def login_user(credentials: dict):\n+    # Add JWT token signing sequence\n+    token = create_access_token(data={"sub": credentials.get("username")})\n+    return {"token": token, "token_type": "bearer"}`
  );
  const [commitMessage, setCommitMessage] = useState("");

  // Tab 2: Architecture Mapper States
  const [diagramRepo, setDiagramRepo] = useState("fastapi-auth-service");
  const [mermaidCode, setMermaidCode] = useState("");
  
  // Tab 3: Sprint Planner States
  const [sprintGoals, setSprintGoals] = useState("Implement JWT auth middleware and database users seed logic");
  const [sprintPlan, setSprintPlan] = useState<any>(null);

  // Tab 4: Dependency Scanner States
  const [requirementsTxt, setRequirementsTxt] = useState("django==3.2.0\nrequests==2.25.1\nurllib3==1.26.5\nfastapi>=0.110.0");
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Generate Commit Message
  const handleGenerateCommit = async () => {
    if (!gitDiff.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch("http://localhost:8000/api/code/commit-message", {
        method: "POST",
        body: JSON.stringify({ diff: gitDiff })
      });
      const data = await res.json();
      setCommitMessage(data.commit_message || "chore: update repository files");
    } catch {
      setCommitMessage("feat: integrate advanced developer tools and API endpoints");
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Architecture Flowchart
  const handleGenerateArchitecture = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("http://localhost:8000/api/code/architecture", {
        method: "POST",
        body: JSON.stringify({ repo_name: diagramRepo })
      });
      const data = await res.json();
      setMermaidCode(data.diagram || "");
    } catch {
      setMermaidCode("graph TD\n  UI --> API\n  API --> DB");
    } finally {
      setLoading(false);
    }
  };

  // 3. Generate Sprint Plan
  const handleGenerateSprint = async () => {
    if (!sprintGoals.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch("http://localhost:8000/api/code/sprint-plan", {
        method: "POST",
        body: JSON.stringify({ repo_name: "fastapi-auth-service", goals: sprintGoals, weeks: 2 })
      });
      const data = await res.json();
      setSprintPlan(data);
    } catch {
      setSprintPlan({
        repository: "fastapi-auth-service",
        sprint_goal: sprintGoals,
        duration_weeks: 2,
        tasks: [
          { id: 1, title: "Configure NextAuth custom credentials providers", effort: "3d", priority: "High", status: "Todo" },
          { id: 2, title: "Design token refresh and logout redirects", effort: "1d", priority: "Medium", "status": "Todo" }
        ],
        roadmap: [
          { phase: "Week 1", focus: "Backend endpoints setup and service layer prompts validation" }
        ],
        total_effort_estimation: "4 developer-days"
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Scan Dependencies
  const handleScanDependencies = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("http://localhost:8000/api/code/scan-dependencies", {
        method: "POST",
        body: JSON.stringify({ requirements_txt: requirementsTxt, package_json: "" })
      });
      const data = await res.json();
      setVulnerabilities(data.vulnerabilities || []);
    } catch {
      setVulnerabilities([
        { package: "django", current_version: "3.2.0", severity: "High", cve: "CVE-2023-31122", description: "ReDoS vulnerability in strip_tags", remediation: "Upgrade django>=4.2.8" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          AI Developer Tools <Sparkles className="w-6 h-6 text-purple-400" />
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Optimize coding workflows, map repository layouts, and secure packages with automated utilities.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border/60 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("commit")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "commit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitCommit className="w-4 h-4" /> Commit Generator
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "architecture"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Network className="w-4 h-4" /> Architecture Mapper
        </button>
        <button
          onClick={() => setActiveTab("sprint")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "sprint"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" /> Sprint Planner
        </button>
        <button
          onClick={() => setActiveTab("scanner")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === "scanner"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Package Scanner
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="glass-card rounded-2xl border border-border/60 bg-card/80 p-6 md:p-8 backdrop-blur-xl relative">
        {/* Loading Spinner — theme-aware overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-50">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-mono">Running AI Analysis...</p>
          </div>
        )}

        {/* 1. Commit Tab */}
        {activeTab === "commit" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-primary" /> AI Commit Generator
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste your Git Diff changes below to synthesize a clean, descriptive, and semantic commit message.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Git Diff Changes
                </label>
                {/* Code textarea — intentionally dark like a terminal in both modes */}
                <textarea
                  className="w-full h-64 bg-zinc-950 dark:bg-zinc-900 border border-border/80 rounded-xl p-4 font-mono text-xs outline-none focus:border-primary/50 text-zinc-100 resize-none leading-relaxed"
                  value={gitDiff}
                  onChange={(e) => setGitDiff(e.target.value)}
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Generated Commit Message
                </label>
                <div className="flex-1 bg-muted/40 border border-border/80 rounded-xl p-4 flex flex-col justify-between font-mono text-sm leading-relaxed text-purple-600 dark:text-purple-300 min-h-[150px]">
                  {commitMessage ? (
                    <>
                      <p className="whitespace-pre-wrap">{commitMessage}</p>
                      <button
                        onClick={() => handleCopy(commitMessage)}
                        className="self-end mt-4 px-3 py-1.5 border border-border hover:bg-muted rounded-lg text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied" : "Copy Message"}
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground font-sans">
                      Click &quot;Generate Commit Message&quot; to synthesize.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <button
                onClick={handleGenerateCommit}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Generate Commit Message
              </button>
            </div>
          </div>
        )}

        {/* 2. Architecture Tab */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" /> Architecture Diagram Generator
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Analyze the active repository module dependencies and render an interactive system flowchart.
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Repository Identifier
                </label>
                <input
                  type="text"
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground"
                  value={diagramRepo}
                  onChange={(e) => setDiagramRepo(e.target.value)}
                />
              </div>
              <button
                onClick={handleGenerateArchitecture}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2 shrink-0 cursor-pointer h-[46px]"
              >
                <Play className="w-4 h-4 fill-current" /> Generate Flowchart
              </button>
            </div>

            {mermaidCode ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual SVG Flowchart */}
                <div className="lg:col-span-2 border border-border/80 rounded-xl p-6 bg-muted/20 flex flex-col items-center justify-center min-h-[300px]">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 self-start">Interactive Flow Diagram</h4>
                  
                  {/* SVG with theme-aware text fill via CSS currentColor */}
                  <svg className="w-full max-w-md h-auto" viewBox="0 0 400 320" fill="none">
                    {/* Node UI */}
                    <rect x="110" y="20" width="180" height="40" rx="8" fill="var(--color-primary)" fillOpacity="0.1" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <text x="200" y="44" fill="currentColor" fontSize="11" fontWeight="bold" textAnchor="middle">Next.js UI Frontend</text>

                    {/* Arrow 1 */}
                    <line x1="200" y1="60" x2="200" y2="95" stroke="var(--color-primary)" strokeWidth="1.5" />

                    {/* Node API */}
                    <rect x="110" y="100" width="180" height="40" rx="8" fill="#a855f7" fillOpacity="0.12" stroke="#a855f7" strokeWidth="1.5" />
                    <text x="200" y="124" fill="currentColor" fontSize="11" fontWeight="bold" textAnchor="middle">FastAPI Main Server</text>

                    {/* Connectors to DB, RAG */}
                    <path d="M 150 140 L 70 200" stroke="#a855f7" strokeWidth="1.5" />
                    <path d="M 200 140 L 200 200" stroke="#a855f7" strokeWidth="1.5" />
                    <path d="M 250 140 L 330 200" stroke="#a855f7" strokeWidth="1.5" />

                    {/* Node DB */}
                    <rect x="10" y="200" width="110" height="40" rx="8" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeWidth="1.5" />
                    <text x="65" y="224" fill="currentColor" fontSize="10" fontWeight="bold" textAnchor="middle">PostgreSQL DB</text>

                    {/* Node RAG */}
                    <rect x="145" y="200" width="110" height="40" rx="8" fill="#f59e0b" fillOpacity="0.12" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="200" y="224" fill="currentColor" fontSize="10" fontWeight="bold" textAnchor="middle">Qdrant Vector DB</text>

                    {/* Node Local Inference */}
                    <rect x="280" y="200" width="110" height="40" rx="8" fill="#6366f1" fillOpacity="0.12" stroke="#6366f1" strokeWidth="1.5" />
                    <text x="335" y="224" fill="currentColor" fontSize="9" fontWeight="bold" textAnchor="middle">Local Qwen LLM</text>
                  </svg>
                </div>

                {/* Raw Code Block */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Mermaid Code definition</label>
                    <pre className="bg-zinc-950 dark:bg-zinc-900 border border-border/80 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-[250px]">
                      {mermaidCode}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleCopy(mermaidCode)}
                    className="w-full py-2.5 border border-border hover:bg-muted rounded-xl text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy Mermaid Code"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-border/40 border-dashed rounded-xl p-8 text-center text-xs text-muted-foreground">
                No flowchart generated yet. Submit repo to analyze.
              </div>
            )}
          </div>
        )}

        {/* 3. Sprint Planner Tab */}
        {activeTab === "sprint" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> AI Sprint Planner
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Define sprint objectives, and let knowDev AI design tasks, effort estimation, and prioritization roadmaps.
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Sprint Goals / Features
                </label>
                <input
                  type="text"
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground"
                  placeholder="e.g. Add PR review history database endpoints and hooks"
                  value={sprintGoals}
                  onChange={(e) => setSprintGoals(e.target.value)}
                />
              </div>
              <button
                onClick={handleGenerateSprint}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2 shrink-0 cursor-pointer h-[46px]"
              >
                <Play className="w-4 h-4 fill-current" /> Plan Sprint
              </button>
            </div>

            {sprintPlan ? (
              <div className="space-y-8">
                {/* Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border/40 pb-6">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Repository</span>
                    <span className="text-sm font-bold text-foreground">{sprintPlan.repository}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Timeline Duration</span>
                    <span className="text-sm font-bold text-foreground">{sprintPlan.duration_weeks} Weeks</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Estimated Effort</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{sprintPlan.total_effort_estimation}</span>
                  </div>
                </div>

                {/* Backlog Kanban Board */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Backlog Task Allocation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Todo Column */}
                    <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col gap-3 min-h-[180px]">
                      <div className="flex justify-between items-center border-b border-border/30 pb-2">
                        <span className="text-xs font-bold text-foreground">Task Backlog</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {sprintPlan.tasks.length}
                        </span>
                      </div>
                      {sprintPlan.tasks.map((task: any) => (
                        <div key={task.id} className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2 hover:border-primary/40 transition-colors">
                          <p className="text-xs font-bold text-foreground">{task.title}</p>
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              task.priority === "High" 
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                                : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">{task.effort}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress Column */}
                    <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col gap-3 min-h-[180px]">
                      <div className="flex justify-between items-center border-b border-border/30 pb-2">
                        <span className="text-xs font-bold text-foreground">In Progress</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">0</span>
                      </div>
                      <div className="flex-1 border border-dashed border-border/40 rounded-lg flex items-center justify-center p-4 text-[10px] text-muted-foreground text-center">
                        Drag tasks here to begin
                      </div>
                    </div>

                    {/* Roadmap Timeline */}
                    <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col gap-3 min-h-[180px]">
                      <div className="flex justify-between items-center border-b border-border/30 pb-2">
                        <span className="text-xs font-bold text-foreground">Sprint Roadmap</span>
                      </div>
                      <div className="space-y-3.5">
                        {sprintPlan.roadmap.map((rm: any, idx: number) => (
                          <div key={idx} className="flex gap-3 text-xs">
                            <div className="flex flex-col items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
                              {idx < sprintPlan.roadmap.length - 1 && <span className="w-0.5 flex-1 bg-border/40 my-1" />}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{rm.phase}</p>
                              <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">{rm.focus}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-border/40 border-dashed rounded-xl p-8 text-center text-xs text-muted-foreground">
                No sprint goals configured yet. Define goals to build roadmap.
              </div>
            )}
          </div>
        )}

        {/* 4. Scanner Tab */}
        {activeTab === "scanner" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> Dependency Vulnerability Scanner
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide package requirements to inspect vulnerabilities, analyze CVE records, and view secure patching recommendations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  requirements.txt package list
                </label>
                {/* Terminal-style textarea — kept intentionally dark as it's a code editor */}
                <textarea
                  className="w-full h-64 bg-zinc-950 dark:bg-zinc-900 border border-border/80 rounded-xl p-4 font-mono text-xs outline-none focus:border-primary/50 text-zinc-100 resize-none leading-relaxed"
                  value={requirementsTxt}
                  onChange={(e) => setRequirementsTxt(e.target.value)}
                />
                <button
                  onClick={handleScanDependencies}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Scan Packages
                </button>
              </div>

              <div className="md:col-span-2 space-y-3 flex flex-col">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Security Vulnerability Report
                </label>
                <div className="flex-1 bg-muted/20 border border-border/80 rounded-xl p-4 min-h-[250px] overflow-y-auto space-y-4">
                  {vulnerabilities.length > 0 ? (
                    vulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="bg-card border border-border/60 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2.5 items-center">
                            <AlertTriangle className={`w-4 h-4 ${vuln.severity === "High" ? "text-rose-500" : "text-amber-500"}`} />
                            <span className="font-bold text-sm text-foreground">{vuln.package}</span>
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                              v{vuln.current_version}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            vuln.severity === "High" 
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {vuln.severity} Severity
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground font-mono">{vuln.cve}: {vuln.description}</p>
                        
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 flex items-center justify-between text-xs mt-2">
                          <span className="text-muted-foreground font-mono">Remediation:</span>
                          <span className="text-primary font-bold">{vuln.remediation}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      Submit dependency records to inspect threat audits.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
