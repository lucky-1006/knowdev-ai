"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Terminal, 
  Code2, 
  FileCode, 
  GitPullRequest, 
  BookOpen, 
  Settings, 
  LayoutDashboard,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: "dashboard",
      name: "Go to Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => { router.push("/dashboard"); onClose(); }
    },
    {
      id: "repo",
      name: "Analyze Repository",
      icon: <Terminal className="w-4 h-4" />,
      action: () => { router.push("/dashboard/repositories"); onClose(); }
    },
    {
      id: "chat",
      name: "Open AI Chat Assistant",
      icon: <Code2 className="w-4 h-4" />,
      action: () => { router.push("/dashboard/chat"); onClose(); }
    },
    {
      id: "pr",
      name: "Review Pull Request",
      icon: <GitPullRequest className="w-4 h-4" />,
      action: () => { router.push("/dashboard/pr-reviews"); onClose(); }
    },
    {
      id: "docs",
      name: "Generate Documentation",
      icon: <BookOpen className="w-4 h-4" />,
      action: () => { router.push("/dashboard/documentation"); onClose(); }
    },
    {
      id: "kb",
      name: "Search Knowledge Base (RAG)",
      icon: <FileCode className="w-4 h-4" />,
      action: () => { router.push("/dashboard/knowledge-base"); onClose(); }
    },
    {
      id: "theme",
      name: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      icon: theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-500" />,
      action: () => { toggleTheme(); onClose(); }
    },
    {
      id: "settings",
      name: "Open Settings",
      icon: <Settings className="w-4 h-4" />,
      action: () => { router.push("/dashboard/settings"); onClose(); }
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-999 flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl transition-all flex flex-col glow-purple">
        {/* Search Input */}
        <div className="flex items-center border-b border-border/50 px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            className="w-full bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm focus:ring-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-muted/80 text-foreground transition-all duration-150"
              >
                <div className="p-1 rounded bg-muted text-muted-foreground">
                  {cmd.icon}
                </div>
                <span className="flex-grow font-medium">{cmd.name}</span>
                <span className="text-xs text-muted-foreground font-mono">⏎ Select</span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
