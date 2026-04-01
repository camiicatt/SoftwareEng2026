"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Customer {
  full_name: string;
}

export default function AccountButton() {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientBrowser();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data, error } = await supabase
          .from('customers')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setCustomer(data);
        }
      }
      console.log("Current user:", session?.user);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data, error } = await supabase
            .from('customers')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          if (!error && data) {
            setCustomer(data);
          } else {
            setCustomer(null);
          }
        } else {
          setCustomer(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/");
  };

  // Loading state in case there is a delay from supabase
  if (loading) {
    return (
      <div className="inline-flex items-center rounded-sm border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000]">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-widest text-black">
          Hello {customer?.full_name ||user?.email || 'User'}!
        </span>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="inline-flex items-center rounded-sm border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FFD6A5] disabled:opacity-50"
        >
          {loading ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    );
  }

  // Default login/create account button
  return (
    <Link
      href="/login"
      className="inline-flex items-center rounded-sm border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FFD6A5]"
    >
      Login | Create Account
    </Link>
  );
}