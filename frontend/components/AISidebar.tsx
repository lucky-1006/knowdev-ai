"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Trash2, Bot, User } from "lucide-react";
import { apiFetch } from "@/lib/api";


interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRepo?: string;
}

export default function AISidebar({ isOpen, onClose, activeRepo }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your knowDev AI helper. Ask me anything about your active codebase. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Fetch chat API response
      const res = await apiFetch("http://localhost:8000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          repository_url: activeRepo || "mock-repo"
        })
      });
      const data = await res.json();
      
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response || "Sorry, I encountered an issue fetching a response.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Fallback in case backend is offline
      const assistantMsg: Message = {
        role: "assistant",
        content: `I'm analyzing the workspace. You asked: "${input}". (Note: The local FastAPI server appears offline. This is a local mock response.)`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. Ask me anything about your active codebase.",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] border-l border-border bg-card shadow-2xl flex flex-col transition-all duration-300">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-border/60">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span>knowDev AI Assistant</span>
          {activeRepo && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
              {activeRepo.split("/").pop()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={clearChat}
            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}
          >
            <div className={`p-2 rounded-lg flex items-center justify-center shrink-0 w-8 h-8 border ${msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"}`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={`flex flex-col gap-1.5 rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary/5 border border-primary/20 text-foreground" : "bg-muted/40 border border-border/50 text-foreground"}`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[10px] text-muted-foreground self-end">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 self-start max-w-[85%]">
            <div className="p-2 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 w-8 h-8">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted/40 border border-border/50 rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2 bg-muted/20">
        <input
          type="text"
          placeholder="Ask a question about the code..."
          className="flex-1 text-sm bg-card border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary/50 text-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
