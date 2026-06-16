"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";
import { motion } from "framer-motion";
import { 
  Terminal, 
  Code2, 
  ShieldAlert, 
  FileSearch2, 
  BookOpen, 
  Sparkles, 
  Sun, 
  Moon, 
  GitPullRequest,
  CheckCircle,
  Database,
  Layers
} from "lucide-react";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  } as const;

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-primary" />,
      title: "Analyze Repositories",
      desc: "Instantly parse entire codebases to map structure, measure health metrics, and calculate documentation coverage.",
    },
    {
      icon: <Code2 className="w-6 h-6 text-indigo-500" />,
      title: "Generate Code",
      desc: "Synthesize high-quality boilerplate, complex functions, or API routes in seconds using advanced local LLMs.",
    },
    {
      icon: <GitPullRequest className="w-6 h-6 text-purple-500" />,
      title: "Review Pull Requests",
      desc: "Automatically verify code quality, detect security risks, and review diffs before they get merged.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-teal-500" />,
      title: "Create Documentation",
      desc: "Auto-generate README files, detailed API specs, system flowcharts, and architecture documentation with one click.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Terminal className="w-6 h-6 text-primary animate-pulse" />
          <span>knowDev <span className="text-primary font-extrabold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">AI</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full border border-border/50 hover:bg-muted/50 transition-all duration-300"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 hover:scale-105 shadow-md shadow-primary/20 transition-all duration-300">
            Launch Console
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-7xl mx-auto w-full">
        <motion.div 
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Engineer Workspace
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight md:leading-none mb-6">
            Build Better Software <br className="hidden md:inline"/>
            with <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">Local AI Engine</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The flagship open-source AI Software Engineering Assistant that runs PyTorch models locally, executes RAG indexing, analyzes codebase health, and auto-reviews PRs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:opacity-95 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Get Started 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-border/80 bg-card/40 hover:bg-muted/30 transition-all duration-300 font-semibold text-lg text-foreground flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.section 
          id="features" 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mt-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              className="glass-card p-8 rounded-2xl flex flex-col items-start gap-4 hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
              variants={itemVariants}
            >
              <div className="p-3 rounded-xl bg-card border border-border/40 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground glass-panel">
        <div>
          © 2026 knowDev AI. Powered by FastAPI, PyTorch, and Qdrant.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub MCP</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
