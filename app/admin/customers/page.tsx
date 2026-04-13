"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function AdminCustomersPage() {
    const supabase: any = createClientBrowser();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sortField, setSortField] = useState("id");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedCustomer, setEditedCustomer] = useState<Partial<Customer>>({});
    const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});

    type Customer = {
        id: string,
        email: string,
        full_name: string,
        created_at: string,
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
        if (!isAdmin) {
            alert("Must be Admin to edit Customer accounts");
            return;
        }

        console.log("Selected customer", customer.id);
        setEditingId(customer.id as string);
        setEditedCustomer({ ...customer });
    }

    function handleFieldEdit(field: keyof Customer, value: any) {
        setEditedCustomer((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function validateCustomer(data: Partial<Customer>) {
        const newErrors: Partial<Record<keyof Customer, string>> = {};

        if (!data.email || data.email.trim() === "") {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!data.full_name || data.full_name.trim() === "") {
            newErrors.full_name = "Name is required";
        } else if (data.full_name.trim().split(" ").length < 2) {
            newErrors.full_name = "Enter first and last name";
        }

        return newErrors;
    }

    async function saveChanges() {
        if (!isAdmin) {
            alert("Must be Admin to edit Customer accounts");
            return;
        }

        if (!editingId) return;

        const validationErrors = validateCustomer(editedCustomer);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        if (editedCustomer.email !== undefined) {
            const res = await fetch("/api/update-customer-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: editingId,
                    newEmail: editedCustomer.email,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || "Email update failed");
                return;
            }
        }

        const updates: Partial<Customer> = {};

        if (editedCustomer.full_name !== undefined) {
            updates.full_name = editedCustomer.full_name;
        }

        if (editedCustomer.marketing_opt_in !== undefined) {
            updates.marketing_opt_in = editedCustomer.marketing_opt_in;
        }

        if (Object.keys(updates).length > 0) {
            const { error } = await supabase
                .from("customers")
                .update(updates as any)
                .eq("id", editingId);

            if (error) {
                alert("Update failed");
                return;
            }
        }

        await loadCustomers(sortField);
        discardChanges();
    }

    async function discardChanges() {
        setEditingId(null);
        setEditedCustomer({});
    }

    async function handleResetPassword(email: string) {
        if (!isAdmin) {
            alert("Must be Admin to edit Customer accounts");
            return;
        }
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
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">
                                        {customer.id}
                                    </td>
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">
                                        {editingId === customer.id ? (
                                            <div className="flex flex-col">
                                                <input
                                                    value={editedCustomer.full_name || ""}
                                                    onChange={(e) =>
                                                        handleFieldEdit("full_name", e.target.value)
                                                    }
                                                    className={`border px-2 py-1 w-full ${errors.full_name ? "border-red-500" : ""
                                                        }`}
                                                />

                                                {errors.full_name && (
                                                    <span className="text-red-600 text-xs mt-1">
                                                        {errors.full_name}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            customer.full_name
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border bg-[#FFF3E6]">
                                        {editingId === customer.id ? (
                                            <div className="flex flex-col">
                                                <input
                                                    value={editedCustomer.email || ""}
                                                    onChange={(e) =>
                                                        handleFieldEdit("email", e.target.value)
                                                    }
                                                    className={`border px-2 py-1 w-full ${errors.email ? "border-red-500" : ""
                                                        }`}
                                                />

                                                {errors.email && (
                                                    <span className="text-red-600 text-xs mt-1">
                                                        {errors.email}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            customer.email
                                        )}
                                    </td>

                                    <td className="px-4 py-2 border text-center bg-[#FFF3E6]">
                                        {editingId === customer.id ? (
                                            <input
                                                type="checkbox"
                                                checked={editedCustomer.marketing_opt_in || false}
                                                onChange={(e) =>
                                                    handleFieldEdit("marketing_opt_in", e.target.checked)
                                                }
                                            />
                                        ) : customer.marketing_opt_in ? "Yes" : "No"}
                                    </td>

                                    <td className="px-4 py-2 border bg-[#FFF3E6]">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-2 border bg-[#FFF3E6]">
                                        <div className="flex justify-center items-center gap-3">
                                            {editingId === customer.id ? (
                                                <>
                                                    <button
                                                        onClick={saveChanges}
                                                        className="border-2 border-black px-3 py-1 text-xs font-black uppercase hover:bg-[#88A7A9] hover:text-white"
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        onClick={discardChanges}
                                                        className="border-2 border-black px-3 py-1 text-xs font-black uppercase hover:bg-[#D97B66] hover:text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(customer)}
                                                        className="min-w-[80px] border-2 border-black px-3 py-1 text-xs font-black uppercase hover:bg-[#88A7A9] hover:text-white"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleResetPassword(customer.email as string)
                                                        }
                                                        className="whitespace-nowrap min-w-[120px] border-2 border-black px-3 py-1 text-xs font-black uppercase hover:bg-[#D97B66] hover:text-white"
                                                    >
                                                        Reset Password
                                                    </button>
                                                </>
                                            )}
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