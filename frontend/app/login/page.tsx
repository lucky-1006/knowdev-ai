"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Terminal, ShieldAlert, Sparkles, Loader2 } from "lucide-react";

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [username, setUsername] = useState("developer");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Handle errors from URL
  useEffect(() => {
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setErrorMsg("Invalid username or password. Try 'developer'.");
      } else {
        setErrorMsg(`An authentication error occurred: ${errorParam}`);
      }
    }
  }, [errorParam]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMsg("Sign in failed. Check credentials.");
        setLoading(false);
      } else {
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: "github" | "google") => {
    setErrorMsg("");
    signIn(provider, { callbackUrl });
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md glass-card rounded-3xl border border-border/80 bg-neutral-950/70 p-8 shadow-2xl relative z-10 backdrop-blur-xl">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
          <Terminal className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2">
          knowDev AI <Sparkles className="w-4 h-4 text-purple-400" />
        </h1>
        <p className="text-xs text-muted-foreground">
          Sign in to start auditing repositories, generating docs, and reviewing PRs.
        </p>
      </div>

      {/* Error Callout */}
      {errorMsg && (
        <div className="mb-6 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4 mb-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Username
          </label>
          <input
            type="text"
            className="w-full text-sm bg-neutral-900 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground"
            placeholder="e.g. developer"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Password
          </label>
          <input
            type="password"
            className="w-full text-sm bg-neutral-900 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-foreground"
            placeholder="e.g. password (optional in dev)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In with Development Mode"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-border/40"></div>
        <span className="flex-shrink mx-4 text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
          OAuth Logins
        </span>
        <div className="flex-grow border-t border-border/40"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleOAuthSignIn("github")}
          disabled={loading}
          className="flex items-center justify-center gap-2 border border-border hover:bg-neutral-900/50 hover:border-border/120 rounded-xl py-3 text-xs font-semibold text-foreground transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </button>
        <button
          onClick={() => handleOAuthSignIn("google")}
          disabled={loading}
          className="flex items-center justify-center gap-2 border border-border hover:bg-neutral-900/50 hover:border-border/120 rounded-xl py-3 text-xs font-semibold text-foreground transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.115-5.136 4.115-3.466 0-6.286-2.82-6.286-6.285 0-3.466 2.82-6.286 6.286-6.286 1.525 0 2.922.543 4.01 1.438l3.144-3.144C19.145 2.385 15.824 1.15 12.24 1.15 6.143 1.15 1.15 6.143 1.15 12.24s4.993 11.09 11.09 11.09c5.786 0 10.8-4.184 10.8-11.09 0-.743-.066-1.46-.19-2.155H12.24z" />
          </svg>
          Google
        </button>
      </div>

      <div className="text-center mt-6">
        <span className="text-[10px] text-muted-foreground font-mono">
          Development bypass: login as <code className="text-primary">developer</code>
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-3 relative z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Loading login form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
