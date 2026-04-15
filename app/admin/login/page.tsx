"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = createClientBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function refreshUser() {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email ?? null);
  }

  useEffect(() => {
    refreshUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshUser());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
  
    setBusy(true);
    setStatus("");
  
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Sign-in timed out. Check proxy/cookies.")), 8000)
    );
  
    try {
      const res = await Promise.race([
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        timeout,
      ]);
  
      if (res.error) {
        setStatus(`Sign in failed: ${res.error.message}`);
        return;
      }
  
      setStatus("Signed in! Redirecting…");
      window.location.assign("/admin");
    } catch (err: any) {
      setStatus(` ${err?.message ?? "Sign-in failed"}`);
    } finally {
      setBusy(false);
    }
  }
  

  async function signUp() {
    if (busy) return;

    setBusy(true);
    setStatus("");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      // This is the expected case if the account exists
      if (error.message.toLowerCase().includes("already")) {
        setStatus("Account already exists. Use Sign in.");
      } else {
        setStatus(`Sign up failed: ${error.message}`);
      }
      setBusy(false);
      return;
    }

    setStatus("Account created. Now click Sign in.");
    setBusy(false);
  }

  // If already logged in, show the direct button
  if (userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4 border-4 border-black p-6 bg-[#F7E8D6]">
          <h1 className="text-2xl font-black uppercase">Admin Login</h1>
          <p className="font-semibold">Logged in as:</p>
          <p className="break-all">{userEmail}</p>

          <div className="flex gap-3">
            <a
              href="/admin"
              className="inline-flex items-center rounded bg-black text-white px-4 py-2"
            >
              Go to Admin
            </a>
          </div>

          {status ? (
            <div className="text-sm border-2 border-black p-2">{status}</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 border-4 border-black p-6 bg-[#F7E8D6]">
        <h1 className="text-2xl font-black uppercase">Admin Login</h1>

        <form className="space-y-3" onSubmit={signIn}>
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            type="email"
            required
          />
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="group w-full rounded bg-black text-white p-2 hover:bg-stone-800 disabled:opacity-50"
          >
            <span className="relative">
              {busy ? "Signing in..." : "Sign in"}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-current transition-all duration-150 group-hover:w-full" />
            </span>
          </button>
        </form>

        {status ? (
          <div className="text-sm border-2 border-black p-2">{status}</div>
        ) : null}
      </div>
    </div>
  );
}
