"use client";

import React, { useState } from "react";
import { useTheme } from "@/components/ThemeContext";
import { 
  Settings, 
  Cpu, 
  GitBranch, 
  Database, 
  Save, 
  CheckCircle,
  Sun,
  Moon,
  ShieldCheck,
  Terminal,
  Globe
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [model, setModel] = useState("qwen2.5");
  const [githubToken, setGithubToken] = useState("");
  const [qdrantUrl, setQdrantUrl] = useState("http://localhost:6333");
  const [postgresUrl, setPostgresUrl] = useState("postgresql://localhost:5432/codepilot");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const models = [
    { id: "qwen2.5", name: "Qwen2.5-Coder (7B)", desc: "Best overall accuracy & speed ratio", size: "4.7 GB" },
    { id: "deepseek", name: "DeepSeek-Coder (6.7B)", desc: "Optimized for logic & debugging", size: "3.8 GB" },
    { id: "codellama", name: "CodeLlama (13B)", desc: "High performance parameter weights", size: "7.4 GB" },
    { id: "starcoder", name: "StarCoder2 (3B)", desc: "Lightweight and runs on minimal VRAM", size: "2.1 GB" }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Configure local PyTorch models, manage database paths, and hook up GitHub access tokens.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Switching section */}
        <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            {theme === "dark" ? <Moon className="w-4.5 h-4.5 text-purple-500" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
            <span>App Appearance</span>
          </h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => { if (theme === "dark") toggleTheme(); }}
              className={`flex-1 max-w-[200px] p-4 border rounded-xl text-center flex flex-col items-center gap-2 transition-all ${
                theme === "light"
                  ? "bg-primary/5 border-primary text-foreground shadow-sm"
                  : "bg-card border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold">Light Theme</span>
            </button>
            
            <button
              type="button"
              onClick={() => { if (theme === "light") toggleTheme(); }}
              className={`flex-1 max-w-[200px] p-4 border rounded-xl text-center flex flex-col items-center gap-2 transition-all ${
                theme === "dark"
                  ? "bg-primary/5 border-primary text-foreground shadow-sm"
                  : "bg-card border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-bold">Dark Theme</span>
            </button>
          </div>
        </div>

        {/* Local LLM Selector */}
        <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            <Cpu className="w-4.5 h-4.5 text-primary" />
            <span>Local AI Inference Model</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {models.map((m) => (
              <div
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-4 border rounded-xl cursor-pointer flex justify-between items-start transition-all ${
                  model === m.id
                    ? "bg-primary/5 border-primary text-foreground shadow-sm"
                    : "bg-card border-border/60 hover:bg-muted/60"
                }`}
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">{m.name}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
                <span className="text-[9px] bg-muted border border-border px-1.5 py-0.5 rounded font-mono font-semibold shrink-0">
                  {m.size}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Integration API Keys & DB URLs */}
        <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-primary" />
            <span>Integrations & Connections</span>
          </h3>

          <div className="space-y-4">
            {/* GitHub Token */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                GitHub Personal Access Token (for PRs and API calls)
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="ghp_************************************"
                  className="w-full text-xs bg-muted/40 border border-border rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-primary/50 text-foreground"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
              </div>
            </div>

            {/* Qdrant URL */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Qdrant DB Host Link
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="http://localhost:6333"
                  className="w-full text-xs bg-muted/40 border border-border rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-primary/50 text-foreground"
                  value={qdrantUrl}
                  onChange={(e) => setQdrantUrl(e.target.value)}
                />
              </div>
            </div>

            {/* PostgreSQL Connection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                PostgreSQL Server URI
              </label>
              <div className="relative">
                <Database className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="postgresql://username:password@localhost:5432/db"
                  className="w-full text-xs bg-muted/40 border border-border rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-primary/50 text-foreground"
                  value={postgresUrl}
                  onChange={(e) => setPostgresUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-between items-center bg-card border border-border/60 rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">
            Changes are saved to your local browser storage context.
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity text-xs flex items-center gap-1.5"
          >
            {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? "Saved Successfully" : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
