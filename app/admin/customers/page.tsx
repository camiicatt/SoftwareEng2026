"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export default function AdminCustomersPage() {

    return (
    <div className="p-6 max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black uppercase">Manage Customer Accounts</h1>
            <a className="underline underline-offset-4" href="/admin">
                Back to Dashboard
            </a>
        </div>
    </div>
    );
}