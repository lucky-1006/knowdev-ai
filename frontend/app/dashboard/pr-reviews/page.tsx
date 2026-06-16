"use client";

import React, { useState, useEffect } from "react";
import { 
  GitPullRequest, 
  ShieldAlert, 
  Flame, 
  Lightbulb, 
  CheckCircle,
  FileDiff,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  History,
  Clock,
  User,
  AlertCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";


interface ReviewItem {
  file: string;
  line: number;
  issue: string;
  severity: "high" | "medium" | "low";
  category: "security" | "quality" | "performance";
  code_before: string;
  code_after: string;
}

interface PRDetails {
  pr_url: string;
  pr_title: string;
  pr_author: string;
  additions: number;
  deletions: number;
  files_changed: number;
  overall_status: string;
}

interface HistoryItem {
  pr_url: string;
  pr_title: string;
  pr_author: string;
  created_at: string;
  files_changed: number;
  additions: number;
  deletions: number;
}

export default function PRReviewsPage() {
  const [prUrl, setPrUrl] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState("");
  
  const [prDetails, setPrDetails] = useState<PRDetails | null>(null);
  const [findings, setFindings] = useState<ReviewItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"security" | "quality" | "performance">("security");

  // Fetch history list — silently swallows errors when backend is offline
  const fetchHistory = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await apiFetch("http://localhost:8000/api/pr/history", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // Backend offline — history stays empty, no error shown to user
    }
  };

  // Fetch latest review on mount — silently fails when backend is offline
  useEffect(() => {
    const fetchLatestReview = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await apiFetch("http://localhost:8000/api/pr/latest", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setPrDetails({
            pr_url: data.pr_url,
            pr_title: data.pr_title,
            pr_author: data.pr_author,
            additions: data.additions,
            deletions: data.deletions,
            files_changed: data.files_changed,
            overall_status: data.overall_status
          });
          setFindings(data.findings);
          setPrUrl(data.pr_url);
          setHasData(true);
        }
      } catch {
        // Backend offline — page shows empty state, no error shown to user
      }
    };

    fetchLatestReview();
    fetchHistory();
  }, []);

  // Handle PR URL submission
  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl) return;
    setIsReviewing(true);
    setError("");

    try {
      const res = await apiFetch("http://localhost:8000/api/pr/review", {
        method: "POST",
        body: JSON.stringify({ pr_url: prUrl })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPrDetails({
          pr_url: data.pr_url,
          pr_title: data.pr_title,
          pr_author: data.pr_author,
          additions: data.additions,
          deletions: data.deletions,
          files_changed: data.files_changed,
          overall_status: data.overall_status
        });
        setFindings(data.findings);
        setHasData(true);
        fetchHistory(); // Refresh history
      } else {
        const errData = await res.json();
        setError(errData.detail || "An error occurred while analyzing the PR.");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  // Fetch cached PR review by URL from history
  const loadReviewFromHistory = async (url: string) => {
    setIsReviewing(true);
    setError("");
    setPrUrl(url);

    try {
      const res = await apiFetch(`http://localhost:8000/api/pr/review?pr_url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setPrDetails({
          pr_url: data.pr_url,
          pr_title: data.pr_title,
          pr_author: data.pr_author,
          additions: data.additions,
          deletions: data.deletions,
          files_changed: data.files_changed,
          overall_status: data.overall_status
        });
        setFindings(data.findings);
        setHasData(true);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to retrieve the selected review.");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  // Split findings into tabs
  const securityRisks = findings.filter(f => f.category === "security");
  const codeQuality = findings.filter(f => f.category === "quality");
  const performanceIssues = findings.filter(f => f.category === "performance");

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const renderReviewList = (items: ReviewItem[]) => {
    if (items.length === 0) {
      return (
        <div className="border border-border/60 rounded-2xl p-10 bg-card/30 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-foreground">No issues identified in this category!</h3>
          <p className="text-xs text-muted-foreground">The changes look clean, structured, and compliant.</p>
        </div>
      );
    }

    return items.map((item, idx) => (
      <div key={idx} className="border border-border/80 rounded-2xl p-6 bg-card space-y-4 shadow-sm hover:border-border/100 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded border border-border">
              {item.file}:{item.line}
            </span>
            <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${getSeverityBadgeColor(item.severity)}`}>
              {item.severity} severity
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">Suggested Refactor</span>
        </div>

        <p className="text-sm font-semibold text-foreground leading-relaxed">{item.issue}</p>

        {/* Diff View */}
        {(item.code_before || item.code_after) && (
          <div className="rounded-xl overflow-hidden border border-border text-xs font-mono">
            {/* Before */}
            {item.code_before && (
              <div className="bg-rose-500/5 p-4 border-b border-border">
                <div className="text-[10px] font-bold text-rose-500/80 mb-1 tracking-wider">- ORIGINAL</div>
                <pre className="text-rose-600 dark:text-rose-400 overflow-x-auto whitespace-pre leading-relaxed">{item.code_before}</pre>
              </div>
            )}
            {/* After */}
            {item.code_after && (
              <div className="bg-emerald-500/5 p-4">
                <div className="text-[10px] font-bold text-emerald-500/80 mb-1 tracking-wider">+ PROPOSED FIX</div>
                <pre className="text-emerald-600 dark:text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">{item.code_after}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Pull Request Reviewer</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Analyze code changes, detect vulnerabilities, evaluate performance, and generate quick-apply refactor patches.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Review Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Input section */}
          <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
            <h2 className="text-lg font-bold">Submit a Pull Request for Review</h2>
            <form onSubmit={handleReview} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <GitPullRequest className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter GitHub Pull Request URL (e.g., https://github.com/user/repo/pull/12)"
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl pl-9 pr-4 py-3 outline-none focus:border-primary/50 text-foreground"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  disabled={isReviewing}
                />
              </div>
              <button
                type="submit"
                disabled={isReviewing || !prUrl}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                {isReviewing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reviewing...</span>
                  </>
                ) : (
                  "Analyze PR"
                )}
              </button>
            </form>
            
            {error && (
              <div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Review Results */}
          {isReviewing ? (
            <div className="glass-card rounded-2xl p-12 border border-border/60 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Running AI Differential Code Audit</h3>
                <p className="text-xs text-muted-foreground">Checking changed hunks, searching database injection points and API leaks...</p>
              </div>
            </div>
          ) : hasData && prDetails ? (
            <div className="space-y-6">
              
              {/* PR Header Summary Card */}
              <div className="glass-card rounded-2xl p-6 border border-border/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {prDetails.overall_status === "changes_requested" ? (
                      <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Changes Requested
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    )}
                    <span className="text-xs font-mono text-muted-foreground">
                      PR #{prDetails.pr_url.split("/pull/")[1] || "12"}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold flex items-center gap-1.5 leading-snug">
                    {prDetails.pr_title}
                    <a 
                      href={prDetails.pr_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {prDetails.pr_author}</span>
                    <span>•</span>
                    <span>{prDetails.files_changed} files changed</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-semibold">+{prDetails.additions}</span>
                    <span className="text-rose-500 font-semibold">-{prDetails.deletions}</span>
                  </div>
                </div>
                
                <div className="flex gap-4 text-center shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
                  <div className="flex-1 px-3">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Security</span>
                    <span className={`text-xl font-extrabold ${securityRisks.length > 0 ? "text-rose-500" : "text-muted-foreground"}`}>
                      {securityRisks.length}
                    </span>
                  </div>
                  <div className="flex-1 px-3 border-x border-border/40">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quality</span>
                    <span className={`text-xl font-extrabold ${codeQuality.length > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                      {codeQuality.length}
                    </span>
                  </div>
                  <div className="flex-1 px-3">
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Performance</span>
                    <span className={`text-xl font-extrabold ${performanceIssues.length > 0 ? "text-blue-500" : "text-muted-foreground"}`}>
                      {performanceIssues.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Results Tabs Navigation */}
              <div className="flex border-b border-border/60">
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "security"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Security Risks ({securityRisks.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("quality")}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "quality"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Code Quality ({codeQuality.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("performance")}
                  className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "performance"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Performance Issues ({performanceIssues.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="space-y-4">
                {activeTab === "security" && renderReviewList(securityRisks)}
                {activeTab === "quality" && renderReviewList(codeQuality)}
                {activeTab === "performance" && renderReviewList(performanceIssues)}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 border border-border/60 text-center space-y-3">
              <GitPullRequest className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">No Pull Request Loaded</h3>
                <p className="text-xs text-muted-foreground">Submit a GitHub PR URL above or select a previous run from the history sidebar to begin auditing.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar History Panel */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4 h-fit">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Audits
            </h3>
            
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4">No reviews recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadReviewFromHistory(item.pr_url)}
                    className="w-full text-left p-3 rounded-xl border border-border/40 hover:border-primary/40 bg-card/50 hover:bg-card transition-all space-y-2 block focus:outline-none"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-xs text-foreground line-clamp-1 flex-grow">
                        {item.pr_title}
                      </h4>
                      <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                        #{item.pr_url.split("/pull/")[1] || "12"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500">+{item.additions}</span>
                        <span className="text-rose-500">-{item.deletions}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
