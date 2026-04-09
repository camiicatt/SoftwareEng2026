"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
        window.location.assign("/");
      }
    } catch (err: any) {
      setStatus(err?.message ?? "Sign-in failed");
    } finally {
      setBusy(false);
    }
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
            className="w-full border-2 border-black rounded p-2 bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
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

          <Link
            href="/signup"
            className="group w-full rounded border-2 border-black p-2 text-center inline-block bg-[#F2D23C] hover:bg-[#EDDB7E] disabled:opacity-50"
          >
            <span className="relative">
              Create account
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-current transition-all duration-150 group-hover:w-full" />
            </span>
          </Link>
        </form>

        {status ? (
          <div className="text-sm border-2 border-black p-2">{status}</div>
        ) : null}
      </div>
    </div>
  );
}