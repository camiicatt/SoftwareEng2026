"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClientBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  async function checkIfAdmin(email: string | null) {
    if (!email) return false;

    const { data, error } = await supabase
      .from("admins") 
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("Admin check failed:", error.message);
      return false;
    }

    return !!data;
  }

  async function refreshUser() {
    const { data } = await supabase.auth.getUser();
    const currentEmail = data.user?.email?.toLowerCase() ?? null;

    setUserEmail(currentEmail);

    if (currentEmail) {
      const admin = await checkIfAdmin(currentEmail);
      setIsAdmin(admin);
    } else {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    refreshUser();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    return () => sub.subscription.unsubscribe();

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

      if ("error" in res && res.error) {
        setStatus(`Sign in failed: ${res.error.message}`);
        return;
      }

      const signedInEmail = email.trim().toLowerCase();
      const admin = await checkIfAdmin(signedInEmail);

      if (admin) {
        setIsAdmin(true);
        setUserEmail(signedInEmail);
        setStatus("Admin signed in! Redirecting...");
        window.location.assign("/admin");
      } else {
        setIsAdmin(false);
        setUserEmail(signedInEmail);
        setStatus("All logged in! Check out our storefront to start buying albums.");
        window.location.assign("/storefront");
      }
    } catch (err: any) {
      setStatus(err?.message ?? "Sign-in failed");
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

  async function signOut() {
    await supabase.auth.signOut();
    setStatus("Signed out.");
    setUserEmail(null);
    setIsAdmin(false);
  }

  if (userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4 border-4 border-black p-6 bg-[#F7E8D6]">
          <h1 className="text-2xl font-black uppercase">
            {isAdmin ? "Admin Login" : "Welcome Back!"}
          </h1>

          <p className="font-semibold">Logged in as:</p>
          <p className="break-all">{userEmail}</p>

          {!isAdmin && (
            <div className="text-sm border-2 border-black p-2">
              All logged in! Check out our storefront to start buying albums.
            </div>
          )}

          <div className="flex gap-3">
            <a
              href={isAdmin ? "/admin" : "/shop"}
              className="inline-flex items-center rounded bg-black text-white px-4 py-2"
            >
              {isAdmin ? "Go to Admin" : "Go to Storefront"}
            </a>

            <button
              onClick={signOut}
              className="inline-flex items-center rounded border-2 border-black px-4 py-2"
            >
              Sign out
            </button>
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
        <h1 className="text-2xl font-black uppercase">Login Here!</h1>

        <form className="space-y-3" onSubmit={signIn}>
          <input
            className="w-full border-2 border-black rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
            required
          />
          <input
            className="w-full border-2 border-black rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-black text-white p-2 disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={signUp}
            disabled={busy}
            className="w-full rounded border-2 border-black p-2 disabled:opacity-60"
          >
            Create account
          </button>
        </form>

        {status ? (
          <div className="text-sm border-2 border-black p-2">{status}</div>
        ) : null}
      </div>
    </div>
  );
}