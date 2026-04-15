"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function AccountButton() {
  const supabase = createClientBrowser();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      setEmail(user?.email ?? null);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[5px_5px_0_0_#000]">
        Account
      </div>
    );
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center rounded-sm border-2 border-black bg-[#88A7A9] px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-white"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex min-w-[220px] items-center justify-between border-2 border-black bg-white px-3 py-2 shadow-[5px_5px_0_0_#000]">
    <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
        Signed In
        </div>
        <div className="truncate text-sm font-black text-black" title={email}>
        {email}
        </div>
    </div>

    <button
        onClick={handleSignOut}
        className="ml-3 shrink-0 border-2 border-black bg-black px-3 py-2 text-[11px] font-black uppercase tracking-widest text-[#FFF3E6]"
    >
        Sign Out
    </button>
    </div>
  );
}