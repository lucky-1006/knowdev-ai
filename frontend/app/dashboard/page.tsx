"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Flame, 
  BookOpen, 
  Activity, 
  ArrowRight, 
  GitPullRequest, 
  Terminal, 
  Code2, 
  TrendingUp 
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      label: "Health Score",
      value: "85/100",
      change: "+2% this week",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/20",
      description: "Codebase quality and coverage rating."
    },
    {
      label: "Security Risks",
      value: "4",
      change: "-1 critical vulnerability",
      color: "from-rose-500/20 to-orange-500/20 text-rose-500 border-rose-500/20",
      description: "Vulnerabilities needing immediate review."
    },
    {
      label: "Code Smells",
      value: "12",
      change: "Clean refactor candidates",
      color: "from-amber-500/20 to-yellow-500/20 text-amber-500 border-amber-500/20",
      description: "Cognitive complexity and duplicate blocks."
    },
    {
      label: "Docs Coverage",
      value: "70%",
      change: "+15% from auto-gen",
      color: "from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/20",
      description: "API methods and readme documentation."
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "review",
      title: "Completed PR Review",
      desc: "Analyzed pull request #12 (added JWT auth route). Discovered 1 SQL injection smell.",
      time: "25 minutes ago",
      icon: <GitPullRequest className="w-4 h-4 text-purple-500" />
    },
    {
      id: 2,
      type: "docs",
      title: "Generated Architecture Docs",
      desc: "Created system design markdown and db relationship models for fastapi-auth-service.",
      time: "2 hours ago",
      icon: <BookOpen className="w-4 h-4 text-teal-500" />
    },
    {
      id: 3,
      type: "security",
      title: "Security Threat Blocked",
      desc: "Identified hardcoded API Secret Key inside config.py (Line 42) during indexing.",
      time: "4 hours ago",
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />
    },
    {
      id: 4,
      type: "chat",
      title: "AI Session: Code Explanation",
      desc: "Explained authentication middleware token decoding sequence to developer.",
      time: "Yesterday",
      icon: <Code2 className="w-4 h-4 text-blue-500" />
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Console Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            System overview and health metrics for the active repository: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">fastapi-auth-service</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/repositories" className="px-4 py-2 border border-border bg-card/60 hover:bg-muted/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all">
            <Terminal className="w-3.5 h-3.5" /> Analyze New Repo
          </Link>
        </div>
      </div>

      {/* Grid Cards - Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 border border-border/60 flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-gradient-to-br font-semibold ${stat.color.split(" ")[0]} ${stat.color.split(" ")[1]} ${stat.color.split(" ")[2]} ${stat.color.split(" ")[3]}`}>
                {stat.change}
              </span>
            </div>
            <div className="my-4">
              <span className="text-3xl font-extrabold tracking-tight">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Main Panel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Repository Health Trends */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-border/60 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Activity and Scans Trend</h2>
              <p className="text-xs text-muted-foreground">Historical metrics trends over past 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Scanning frequency high</span>
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="h-64 w-full relative">
            <svg viewBox="0 0 500 200" className="w-full h-full text-primary" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4" />
              
              {/* Path Area */}
              <path 
                d="M 0 160 Q 80 130 160 120 T 320 90 T 480 50 L 500 50 L 500 200 L 0 200 Z" 
                fill="url(#chartGrad)" 
              />
              {/* Path Line */}
              <path 
                d="M 0 160 Q 80 130 160 120 T 320 90 T 480 50 L 500 50" 
                fill="none" 
                stroke="var(--color-primary)" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              {/* Reference dots */}
              <circle cx="160" cy="120" r="4.5" fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth="1.5" />
              <circle cx="320" cy="90" r="4.5" fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth="1.5" />
              <circle cx="480" cy="50" r="4.5" fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth="1.5" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[10px] text-muted-foreground font-mono mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border/40 pt-6">
            <div className="text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Lines Scanned</span>
              <span className="text-xl font-bold">14,250</span>
            </div>
            <div className="text-center border-x border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Chunks</span>
              <span className="text-xl font-bold">154</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">RAG Embeddings</span>
              <span className="text-xl font-bold">Qdrant Cloud</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Activities */}
        <div className="glass-card rounded-2xl p-6 border border-border/60 flex flex-col justify-between space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Recent Activities</h2>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 items-start text-xs border-b border-border/30 pb-3 last:border-0 last:pb-0">
                <div className="p-1.5 rounded-lg bg-muted border border-border shrink-0 mt-0.5">
                  {act.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{act.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{act.desc}</p>
                  <span className="text-[10px] text-muted-foreground/80 font-mono block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/dashboard/chat" className="text-xs text-primary font-bold hover:underline flex items-center justify-center gap-1 pt-2 border-t border-border/40">
            Open Chat Console <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
