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
    const [authLoading, setAuthLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    const router = useRouter();
    const supabase = createClientBrowser();

    // Fetch user and customer data
    // If user is admin, we don't attempt to fetch customer data since admins won't have a customer record
    useEffect(() => {
        async function fetchUser() {
            const { data: authData } = await supabase.auth.getUser();


            const currentUser = authData.user;
            setUser(currentUser);

            // Add check to ensure we only fetch customer data if the user is not an admin
            if (currentUser && !currentUser.user_metadata.is_admin) {
                const { data: customerData, error } = await supabase
                    .from("customers")
                    .select("full_name")
                    .eq("id", currentUser.id)
                    .maybeSingle();

                if (error) {
                    console.error("Failed to fetch customer data:", error.message);
                } else {
                    setCustomer(customerData);
                }
            }

            setAuthLoading(false);
        }

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    async function signOut() {
        setSigningOut(true);
        const { error } = await supabase.auth.signOut();
        setSigningOut(false);
        if (error) {
            console.error("Sign out failed:", error.message);
        } else {
            // If we are on admin page, go back to admin login after sign out. Otherwise, just refresh.
            if (window.location.pathname.startsWith("/admin")) {
                router.push("/admin/login");
            } else {
                router.refresh();
            }
        }
    }

    if (authLoading) {
        // Return a loading button while we check auth status
        return (
            <button
                disabled
                className="inline-flex items-center rounded-sm border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000] transition-all duration-150"
            >
                Loading...
            </button>
        );
    }

    // Return login/create account button if no user, otherwise show welcome message and sign out
    if (!user) {
        return (
            <Link
                href="/login"
                className="inline-flex items-center rounded-sm border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FFD6A5]"
            >
                Login | Create Account
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
                Welcome, {customer ? customer.full_name : user?.email}!
            </span>
            <button
                onClick={signOut}
                disabled={signingOut}
                className="inline-flex items-center rounded border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FFD6A5] disabled:opacity-50"
            >
                Sign out
            </button>
        </div>
    );

}
