import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Although it shouldn't ever occur, prevent update id or created_at timestamp
    const allowedFields = [
      "name",
      "title",
      "artist",
      "description",
      "price",
      "quantity",
      "image_url",
      "category",
      "genre",
    ];

    const updates: Record<string, any> = {};

    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    // Prevent empty update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}