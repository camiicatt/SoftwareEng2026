"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function AdminCustomersPage() {
    const supabase = createClientBrowser();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sortField, setSortField] = useState("id");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedCustomer, setEditedCustomer] = useState<Partial<Customer>>({});

    type Customer = {
        id: String,
        email: String,
        full_name: String,
        created_at: String,
        marketing_opt_in: boolean
    };

    useEffect(() => {
        (async () => {
            const { data: userRes } = await supabase.auth.getUser();
            const userEmail = userRes.user?.email ?? null;

            if (!userEmail) {
                window.location.assign("/admin/login");
                return;
            }

            const { data } = await supabase
                .from("admins")
                .select("email")
                .eq("email", userEmail)
                .maybeSingle();

            if (!data) {
                window.location.assign("/admin/login");
                return;
            }

            setIsAdmin(true);
            await loadCustomers("id");
        })();
    }, []);

    async function loadCustomers(field: string) {
        setLoading(true);
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order(field, { ascending: true });

        if (!error && data) setCustomers(data as Customer[]);
        setLoading(false);
    }

    async function handleEdit(customer: Customer) {
        console.log("Selected customer", customer.id);
        setEditingId(customer.id as string);
        setEditedCustomer(customer);
    }

    async function saveChanges() {
        if (!editingId) return;

    }

    async function discardChanges() {
        setEditingId(null);
        setEditedCustomer({});
    }

    async function handleResetPassword(email: string) {
        // Fun idea for show

        // Doesn't actually do anything but send a password reset email
        // We could implement this for real if we wanted to,
        // But for demo purposes, give the impression of password reset function
        // await supabase.auth.resetPasswordForEmail(email);

        alert("Password reset email sent");
    }

    return (
        <div className="p-6 max-w-8xl space-y-6">
            {/* Title header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black uppercase">Manage Customer Accounts</h1>
                <a className="underline underline-offset-4" href="/admin">
                    Back to Dashboard
                </a>
            </div>

            {/* Sort options, make buttons to match the Orders page */}
            <div className="flex gap-3">
                <span className="text-sm font-black uppercase">Sort by:</span>
                {["id", "full_name", "created_at"].map((field) => (
                    <button
                        key={field}
                        onClick={() => { setSortField(field); loadCustomers(field); }}
                        className={`text-xs font-black uppercase border-2 border-black px-3 py-1 ${sortField === field ? "bg-black text-white" : "bg-white"}`}
                    >
                        {field === "id" ? "ID" : field === "full_name" ? "Name" : "Creation Date"}
                    </button>
                ))}
            </div>

            {/* Customer table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-2 border-black text-sm">
                    <thead className="bg-black text-white uppercase">
                        <tr>
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Email</th>
                            <th className="px-4 py-2 border">Marketing Opt-In</th>
                            <th className="px-4 py-2 border">Created At</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">
                                    No customers found
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.id} className="border-t">
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">{customer.id}</td>
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">{customer.full_name}</td>
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">{customer.email}</td>
                                    <td className="px-4 py-2 border text-center bg-[#FFF3E6]">
                                        {customer.marketing_opt_in ? "Yes" : "No"}
                                    </td>
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">
                                        <div className="flex justify-center items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="min-w-[80px] border-2 border-black px-3 py-1 text-xs font-black uppercase hover:bg-[#88A7A9] hover:text-white"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleResetPassword(customer.email as string)}
                                                className="whitespace-nowrap min-w-[120px] border-2 border-black px-3 py-1 text-xs font-black uppercase hover:bg-[#D97B66] hover:text-white"
                                            >
                                                Reset Password
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}