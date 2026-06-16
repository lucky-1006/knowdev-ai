"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  Network, 
  Code2, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Edit3,
  RefreshCw
} from "lucide-react";

export default function DocumentationPage() {
  const [docType, setDocType] = useState<"readme" | "api" | "architecture" | "comments">("readme");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("preview");
  const [copied, setCopied] = useState(false);

  // Pre-mocked documents
  const docs = {
    readme: `# FastAPI Authentication Service

FastAPI-based microservice providing OAuth2 password bearer flow, encrypted JWT token creation, and secure PostgreSQL credential storage.

## Features
- **Bcrypt Hashing**: Secure password hashing algorithms.
- **JWT Middleware**: Context-aware verification of client requests.
- **Structured Database**: SQLAlchemy model mappings for Users and Tokens.

## Installation
\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\``,
    api: `# API Reference Manual

Detailed list of FastAPI endpoints exposed by the service.

### Authentication Endpoints

#### POST \`/api/token\`
Exchanges username and password for a JWT bearer token.
- **Request Body**: \`application/x-www-form-urlencoded\`
- **Response**: JWT access token.

#### GET \`/api/users/me\`
Fetches account details of the currently authenticated user session.
- **Headers**: \`Authorization: Bearer <Token>\``,
    architecture: `# System Architecture Details

Overview of codebase design and data connections.

### Core Flow Diagram

\`\`\`
Client  ──►  FastAPI Router  ──►  Auth Middleware
                  │                    │
                  ▼                    ▼
             PostgreSQL            JWT Validator
\`\`\`

### Database Relationship Model
- **User Table**: ID (PK), Username (Unique), Hashed Password (String), Active Status (Bool).
- **Session Table**: ID (PK), User ID (FK), Token (String), Expiration (DateTime).`,
    comments: `# Auto-Generated Code Comments

Calculated comments and docstrings suggestions.

### \`app/services/auth.py\`

\`\`\`python
def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Encodes a JWT payload with an expiration timestamp.
    
    Args:
        data (dict): Key-value claims to bundle in the token payload.
        expires_delta (timedelta, optional): Custom token lifetime. Defaults to 15m.
        
    Returns:
        str: Encrypted JWT string.
    """
    to_encode = data.copy()
    ...
\`\`\``
  };

  const [docContent, setDocContent] = useState(docs.readme);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDocContent(docs[docType]);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(docContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([docContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docType}-docs.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Quick markdown styling renderer
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl font-extrabold text-foreground border-b border-border pb-2 mb-4 mt-6 first:mt-0">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-xl font-bold text-foreground mb-3 mt-5">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-lg font-bold text-foreground mb-2 mt-4">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={idx} className="text-sm font-bold text-foreground mb-1.5 mt-3">{line.replace("#### ", "")}</h4>;
      }
      if (line.startsWith("- ")) {
        return <li key={idx} className="text-sm text-muted-foreground list-disc ml-5 mb-1.5 leading-relaxed">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("`")) {
        return <pre key={idx} className="my-3 p-3 bg-zinc-950 text-zinc-100 rounded-lg font-mono text-xs overflow-x-auto">{line.replace(/`/g, "")}</pre>;
      }
      if (line.startsWith("pip") || line.startsWith("uvicorn")) {
        return <pre key={idx} className="my-3 p-3 bg-zinc-950 text-zinc-100 rounded-lg font-mono text-xs overflow-x-auto">{line}</pre>;
      }
      return <p key={idx} className="text-sm text-muted-foreground leading-relaxed mb-3">{line}</p>;
    });
  };

  const templates = [
    { id: "readme", label: "README.md", desc: "Project setup guide", icon: <FileText className="w-4 h-4" /> },
    { id: "api", label: "API Reference", desc: "Endpoint signatures", icon: <Code2 className="w-4 h-4" /> },
    { id: "architecture", label: "Architecture Specs", desc: "System design diagrams", icon: <Network className="w-4 h-4" /> },
    { id: "comments", label: "Code Comments", desc: "Docstring generator", icon: <BookOpen className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Documentation Generator</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Analyze FastAPI routes, calculate structure schemas, and generate beautiful markdown manuals with one click.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Template Options */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Template</h3>
          <div className="flex flex-col gap-2">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  setDocType(tmpl.id);
                  setDocContent(docs[tmpl.id]);
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  docType === tmpl.id
                    ? "bg-primary/5 border-primary text-foreground shadow-sm"
                    : "bg-card border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg border shrink-0 ${docType === tmpl.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"}`}>
                  {tmpl.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{tmpl.label}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{tmpl.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-xs flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Document</span>
              </>
            )}
          </button>
        </div>

        {/* Right Columns: Editor / Preview Box */}
        <div className="lg:col-span-3 glass-card border border-border/60 rounded-2xl flex flex-col h-[600px] overflow-hidden">
          {/* Editor Header Toolbar */}
          <div className="px-4 py-3 bg-muted/30 border-b border-border/60 flex justify-between items-center">
            {/* View Mode Tabs */}
            <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border/50 text-[10px] font-bold">
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
                  viewMode === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
                  viewMode === "edit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Markdown</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                title="Copy Markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={downloadFile}
                className="p-2 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Export File"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Editor Content Box */}
          <div className="flex-1 overflow-y-auto p-6 bg-card/40">
            {viewMode === "edit" ? (
              <textarea
                className="w-full h-full bg-transparent border-0 outline-none resize-none font-mono text-xs leading-relaxed text-foreground"
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                {renderMarkdown(docContent)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
