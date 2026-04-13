import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key to update Supabase auth
);

export async function POST(req: Request) {
    try {
        const { userId, newEmail } = await req.json();

        if (!userId || !newEmail) {
            return NextResponse.json(
                { error: "Missing userId or newEmail" },
                { status: 400 }
            );
        }

        const { error: authError } =
            await supabaseAdmin.auth.admin.updateUserById(userId, {
                email: newEmail,
            });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        const { error: dbError } = await supabaseAdmin
            .from("customers")
            .update({ email: newEmail })
            .eq("id", userId);

        if (dbError) {
            return NextResponse.json(
                { error: dbError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Server error" },
            { status: 500 }
        );
    }
}