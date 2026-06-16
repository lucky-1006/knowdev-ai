"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeContext";
import CommandPalette from "@/components/CommandPalette";
import AISidebar from "@/components/AISidebar";
import { 
  Terminal, 
  Code2, 
  GitPullRequest, 
  BookOpen, 
  Settings, 
  LayoutDashboard, 
  Database,
  Search, 
  Sparkles, 
  Sun, 
  Moon, 
  Menu, 
  ChevronRight,
  FolderOpen,
  LogOut
} from "lucide-react";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  
  // Navigation states
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active repository state (shared mocked list)
  const [repositories] = useState([
    { id: "1", name: "fastapi-auth-service", url: "github.com/coder/fastapi-auth" },
    { id: "2", name: "nextjs-dashboard-app", url: "github.com/coder/nextjs-dashboard" },
    { id: "3", name: "pytorch-rag-engine", url: "github.com/coder/pytorch-rag" }
  ]);
  const [activeRepoId, setActiveRepoId] = useState("1");
  const activeRepo = repositories.find(r => r.id === activeRepoId);

  // Ctrl + K keyboard event trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { name: "Repositories", href: "/dashboard/repositories", icon: <FolderOpen className="w-4.5 h-4.5" /> },
    { name: "Chat", href: "/dashboard/chat", icon: <Code2 className="w-4.5 h-4.5" /> },
    { name: "PR Reviews", href: "/dashboard/pr-reviews", icon: <GitPullRequest className="w-4.5 h-4.5" /> },
    { name: "Documentation", href: "/dashboard/documentation", icon: <BookOpen className="w-4.5 h-4.5" /> },
    { name: "Knowledge Base", href: "/dashboard/knowledge-base", icon: <Database className="w-4.5 h-4.5" /> },
    { name: "AI Tools", href: "/dashboard/tools", icon: <Sparkles className="w-4.5 h-4.5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-4.5 h-4.5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/60 bg-card/50 backdrop-blur-md shrink-0">
        {/* Logo Section */}
        <div className="h-16 px-6 border-b border-border/60 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">
            knowDev{" "}
            <span className="font-extrabold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </div>

        {/* Repos Selection Dropdown */}
        <div className="p-4 border-b border-border/40">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Active Repository
          </label>
          <select
            className="w-full bg-muted/50 border border-border/80 rounded-lg text-xs p-2.5 outline-none font-medium focus:border-primary/50 text-foreground cursor-pointer"
            value={activeRepoId}
            onChange={(e) => setActiveRepoId(e.target.value)}
          >
            {repositories.map(repo => (
              <option key={repo.id} value={repo.id} className="bg-card">
                {repo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile section */}
        {session?.user && (
          <div className="p-4 border-t border-border/60 flex items-center gap-3 bg-muted/10">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary font-mono text-sm uppercase shrink-0">
              {session.user.name?.[0] || session.user.email?.[0] || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{session.user.name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded text-muted-foreground transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/60 text-xs text-muted-foreground flex justify-between items-center">
          <span>Backend V0.1.0</span>
          <div className="flex gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            <span className="font-medium text-emerald-500">Online</span>
          </div>
        </div>
      </aside>


      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          {/* Drawer Menu */}
          <div className="relative w-64 bg-card border-r border-border flex flex-col h-full z-50">
            <div className="h-16 px-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm">knowDev AI</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            </div>
            
            <div className="p-4 border-b border-border/40">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Active Repository
              </label>
              <select
                className="w-full bg-muted border border-border rounded-lg text-xs p-2"
                value={activeRepoId}
                onChange={(e) => setActiveRepoId(e.target.value)}
              >
                {repositories.map(repo => (
                  <option key={repo.id} value={repo.id}>{repo.name}</option>
                ))}
              </select>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* HEADER */}
        <header className="h-16 border-b border-border/60 flex items-center justify-between px-4 md:px-8 bg-card/30 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-muted rounded-lg border border-border/50 text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Ctrl + K Search Bar */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-full border border-border/80 hover:border-primary/40 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold w-64 text-left transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search menu / commands...</span>
              <kbd className="ml-auto px-1.5 py-0.5 rounded border border-border bg-card text-[9px] font-mono tracking-widest">
                ^K
              </kbd>
            </button>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 transition-all duration-200"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>

            {/* AI Assistant Toggle Button */}
            <button
              onClick={() => setIsAISidebarOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-xs border transition-all duration-300 ${
                isAISidebarOpen 
                  ? "bg-primary text-primary-foreground border-primary glow-purple" 
                  : "bg-card hover:bg-muted text-foreground border-border hover:border-primary/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background relative">
          {children}
        </main>
      </div>

      {/* MODALS & PORTALS */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <AISidebar 
        isOpen={isAISidebarOpen} 
        onClose={() => setIsAISidebarOpen(false)} 
        activeRepo={activeRepo ? activeRepo.url : undefined} 
      />
    </div>
  );
}
