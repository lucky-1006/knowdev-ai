"use client";

import React, { useState } from "react";
import { 
  Database, 
  Search, 
  Layers, 
  Cpu, 
  CheckCircle,
  FileCode,
  Network,
  RefreshCw,
  GitCommit
} from "lucide-react";

interface Node {
  id: number;
  name: string;
  type: "auth" | "database" | "api";
  score: number;
  snippet: string;
}

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const nodes: Node[] = [
    {
      id: 1,
      name: "app/services/auth.py",
      type: "auth",
      score: 0.94,
      snippet: "def verify_password(plain, hashed):\n    return pwd_context.verify(plain, hashed)\n\ndef create_access_token(data):\n    # Encodes claims inside JWT and sets expiration timestamp"
    },
    {
      id: 2,
      name: "app/db.py",
      type: "database",
      score: 0.81,
      snippet: "engine = create_engine(DATABASE_URL)\nSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)\nBase = declarative_base()"
    },
    {
      id: 3,
      name: "app/main.py",
      type: "api",
      score: 0.72,
      snippet: "@app.post('/api/token')\nasync def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):\n    user = authenticate_user(form_data.username, form_data.password)"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      // Automatically highlight top node
      setActiveNode(1);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Semantic vector search (RAG) over codebase files and documents.
        </p>
      </div>

      {/* Grid: Search Input & Node Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Search Form and Matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Box */}
          <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
            <h2 className="text-lg font-bold">Query Codebase Context</h2>
            
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. How does jwt token authentication and database creation work?"
                  className="w-full text-sm bg-muted/40 border border-border rounded-xl pl-9 pr-4 py-3 outline-none focus:border-primary/50 text-foreground"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSearching}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !query}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm whitespace-nowrap flex items-center gap-1.5"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>Query</span>
              </button>
            </form>
          </div>

          {/* Results List */}
          {hasSearched && !isSearching && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Semantic Matches</h3>
              
              {nodes.map((node) => (
                <div 
                  key={node.id}
                  onClick={() => setActiveNode(node.id)}
                  className={`glass-card p-5 border rounded-2xl cursor-pointer hover:border-primary/20 transition-all ${
                    activeNode === node.id 
                      ? "border-primary/60 bg-primary/5" 
                      : "border-border/60"
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-border/30 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4.5 h-4.5 text-primary" />
                      <span className="font-bold text-sm">{node.name}</span>
                    </div>
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded-full font-mono">
                      Similarity: {(node.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <pre className="p-3 bg-zinc-950 text-zinc-300 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                    {node.snippet}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Visual Node Network Graph Mocks */}
        <div className="glass-card rounded-2xl p-6 border border-border/60 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-1.5">
              <Network className="w-5 h-5 text-primary" />
              <span>Embedding Network</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Interactive mapping of code chunk embeddings</p>
          </div>

          {/* Vector Network Mock Diagram */}
          <div className="h-64 relative bg-muted/20 border border-border/60 rounded-2xl overflow-hidden flex items-center justify-center">
            {/* SVG Connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none text-border">
              <line x1="25%" y1="25%" x2="75%" y2="25%" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
              <line x1="25%" y1="25%" x2="50%" y2="75%" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
              <line x1="75%" y1="25%" x2="50%" y2="75%" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
            </svg>

            {/* Nodes */}
            <button
              onClick={() => setActiveNode(1)}
              className={`absolute top-[15%] left-[15%] w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 border ${
                activeNode === 1 
                  ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30 animate-pulse" 
                  : "bg-card border-border hover:border-primary/40 text-foreground"
              }`}
            >
              Auth
            </button>

            <button
              onClick={() => setActiveNode(2)}
              className={`absolute top-[15%] right-[15%] w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 border ${
                activeNode === 2 
                  ? "bg-indigo-500 border-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30 animate-pulse" 
                  : "bg-card border-border hover:border-primary/40 text-foreground"
              }`}
            >
              DB
            </button>

            <button
              onClick={() => setActiveNode(3)}
              className={`absolute bottom-[15%] left-[40%] w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 border ${
                activeNode === 3 
                  ? "bg-purple-500 border-purple-500 text-white scale-110 shadow-lg shadow-purple-500/30 animate-pulse" 
                  : "bg-card border-border hover:border-primary/40 text-foreground"
              }`}
            >
              API
            </button>

            {/* Hint overlay */}
            <div className="absolute bottom-2 right-2 text-[8px] text-muted-foreground bg-card/60 px-1.5 py-0.5 rounded border border-border">
              Click nodes to view contents
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground">Database Index Statistics</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/20 pb-1.5">
                <span className="text-muted-foreground">Vector Dimension:</span>
                <span className="font-mono">384 (MiniLM-L6)</span>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-1.5">
                <span className="text-muted-foreground">Distance Metric:</span>
                <span className="font-mono">Cosine</span>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-1.5">
                <span className="text-muted-foreground">Index Status:</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Indexed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
