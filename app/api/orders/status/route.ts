import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OrderStatus = "pending" | "completed" | "cancelled";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const id = String(body?.id ?? "");
        const newStatus = String(body?.status ?? "").toLowerCase() as OrderStatus;
        const userEmail = String(body?.email ?? "");

        if (!id) {
            return NextResponse.json({ error: "Missing order id." }, { status: 400 });
        }

        if (!["pending", "completed", "cancelled"].includes(newStatus)) {
            return NextResponse.json({ error: "Invalid status." }, { status: 400 });
        }

        if (!userEmail) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: adminRow, error: adminError } = await supabaseAdmin
            .from("admins")
            .select("email")
            .eq("email", userEmail)
            .maybeSingle();

        if (adminError) {
            return NextResponse.json({ error: adminError.message }, { status: 500 });
        }

        if (!adminRow) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from("orders")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message || "Failed" },
            { status: 500 }
        );
    }
}