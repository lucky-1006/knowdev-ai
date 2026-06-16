"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Code2, 
  FileCode, 
  Copy, 
  Check, 
  Info,
  Terminal
} from "lucide-react";
import { apiFetch } from "@/lib/api";


interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Format a Date to a locale time string ONLY on the client side.
 * Returns empty string during SSR to prevent hydration mismatches.
 *
 * Uses a stable string key derived from timestamp values as the dependency
 * so the effect does NOT re-run on every render (which would cause an
 * infinite loop because `timestamps` is a new array reference each render).
 */
function useFormattedTime(timestamps: Date[]): string[] {
  const [formatted, setFormatted] = React.useState<string[]>([]);

  // Derive a stable primitive from the actual Date values.
  // This only changes when timestamps are genuinely added/changed.
  const key = timestamps.map((t) => t.getTime()).join(",");

  React.useEffect(() => {
    setFormatted(
      timestamps.map((t) =>
        t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // ← stable primitive, not the array reference

  return formatted;
}


/** Sub-component renders messages with client-only timestamps to avoid hydration mismatch */
function MessageList({
  messages,
  renderMessageContent,
}: {
  messages: Message[];
  renderMessageContent: (content: string) => React.ReactNode;
}) {
  const formattedTimes = useFormattedTime(messages.map((m) => m.timestamp));

  return (
    <>
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse ml-auto" : "self-start mr-auto"}`}
        >
          {/* Avatar */}
          <div
            className={`p-2.5 rounded-xl border shrink-0 w-10 h-10 flex items-center justify-center ${
              msg.role === "user"
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-border/60 text-primary shadow-sm"
            }`}
          >
            {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>

          {/* Bubble */}
          <div
            className={`flex flex-col gap-1 rounded-2xl px-5 py-4 border shadow-sm ${
              msg.role === "user"
                ? "bg-primary/5 border-primary/15"
                : "bg-card/90 border-border/40"
            }`}
          >
            <div className="text-sm font-medium leading-relaxed">
              {renderMessageContent(msg.content)}
            </div>
            {/* Render time only after client hydration (formattedTimes[idx] is "" on server) */}
            <span className="text-[9px] text-muted-foreground self-end mt-2 font-mono">
              {formattedTimes[idx] ?? ""}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your knowDev AI engineering assistant. I have mapped your repository `fastapi-auth-service`. Ask me to explain the structure, write new endpoints, review code, or solve issues.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    { text: "Explain Authentication Flow", desc: "Understand how tokens are parsed and validated." },
    { text: "Generate JWT Middleware", desc: "Write a drop-in token verification middleware." },
    { text: "Check Database Vulnerabilities", desc: "Look for raw SQL injection points in DB files." },
    { text: "Write PyTest Unit Tests", desc: "Write unit tests for router endpoints." }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (msgText: string) => {
    if (!msgText.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: msgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiFetch("http://localhost:8000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: msgText }],
          repository_url: "github.com/coder/fastapi-auth"
        })
      });
      const data = await res.json();
      
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Offline fallback: simulate local intelligence with rich responses depending on prompt!
      let responseContent = "";
      const lowerInput = msgText.toLowerCase();

      if (lowerInput.includes("auth") || lowerInput.includes("authentication")) {
        responseContent = `Here is a detailed overview of the Authentication Flow in **fastapi-auth-service**:

1. **User Login**: The client posts credentials to \`/api/token\`.
2. **Password Verification**: The system checks credentials against Postgres stored bcrypt hashes.
3. **Token Generation**: On success, it encodes the user ID, scopes, and expiration using \`python-jose\` into a JWT.
4. **Protected Routes**: Subsequent requests carry the \`Authorization: Bearer <JWT>\` header.
5. **Middleware Extraction**: The \`get_current_user\` dependency decodes, validates expiration, and retrieves user records.

Here is the implementation of the JWT validation system:

\`\`\`python
# app/services/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import datetime

SECRET_KEY = "super-secret-key-for-local-development"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    return {"username": username, "status": "authenticated"}
\`\`\``;
      } else if (lowerInput.includes("jwt") || lowerInput.includes("middleware")) {
        responseContent = `I have generated a standard FastAPI JWT token middleware system. You can drop this into your \`services/auth.py\` module:

\`\`\`python
# services/auth.py
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-custom-secret-key"
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
\`\`\``;
      } else if (lowerInput.includes("test") || lowerInput.includes("pytest")) {
        responseContent = `Here is a PyTest suite for verifying the authentication endpoints in your FastAPI application:

\`\`\`python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success():
    response = client.post(
        "/api/token",
        data={"username": "admin", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_invalid_credentials():
    response = client.post(
        "/api/token",
        data={"username": "wrong", "password": "bad"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"
\`\`\``;
      } else {
        responseContent = `Based on my repository analysis of your project, you asked: "${msgText}".

Since PyTorch integration is in Phase 1 setup (UI design), here is an outline of what we've indexed:
- **Relational Tables**: users, repositories, chat_history, documents
- **Embedding Chunks**: 154 blocks mapped
- **Vector DB**: Qdrant Vector Search node is active.

Let me know if you would like me to generate standard code blocks or architectural explanations for any of these modules.`;
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse message chunks (extracting triple-backtick blocks)
  const renderMessageContent = (content: string) => {
    const parts = content.split("```");
    return parts.map((part, idx) => {
      // Odd indices are code blocks
      if (idx % 2 === 1) {
        const lines = part.split("\n");
        const header = lines[0] || "code";
        const code = lines.slice(1).join("\n");
        return (
          <div key={idx} className="my-4 rounded-xl border border-border overflow-hidden shadow-lg bg-zinc-950 text-zinc-100 font-mono text-xs w-full glow-purple">
            <div className="flex justify-between items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-sans font-semibold">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-primary" />
                <span>{header.toUpperCase()}</span>
              </div>
              <button
                onClick={() => copyToClipboard(code, idx)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === idx ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed font-mono">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      // Even indices are text blocks (with basic bold markdown parsing)
      return (
        <span key={idx} className="whitespace-pre-wrap leading-relaxed">
          {part.split("**").map((text, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-foreground">{text}</strong> : text)}
        </span>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col justify-between max-w-5xl mx-auto space-y-4">
      {/* Header Info */}
      <div className="border-b border-border/40 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AI Chat Assistant</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Query files, explain code flow, or write scripts using local LLM repository context.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full font-semibold">
          <Terminal className="w-3.5 h-3.5 animate-pulse" />
          <span>Local Engine Active</span>
        </div>
      </div>

      {/* Messages Scrolling Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 rounded-2xl bg-card/10 border border-border/30 shadow-inner">
        <MessageList messages={messages} renderMessageContent={renderMessageContent} />

        {isLoading && (
          <div className="flex gap-4 max-w-[85%] mr-auto">
            <div className="p-2.5 rounded-xl border border-border/60 bg-card text-primary shrink-0 w-10 h-10 flex items-center justify-center">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-card/90 border border-border/40 rounded-2xl px-5 py-4 text-sm text-muted-foreground flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Starter Cards */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.text)}
              className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/80 hover:border-primary/20 hover:scale-[1.01] transition-all duration-200 text-left space-y-1"
            >
              <h4 className="text-xs font-bold text-foreground">{prompt.text}</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{prompt.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
        className="p-3 border border-border bg-card/60 rounded-2xl flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Ask knowDev AI to write functions, explain endpoints, or review code..."
          className="flex-grow text-sm bg-transparent border-0 outline-none px-2 py-1 text-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
