import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {

  const { id: rawId } = await context.params;

  if (!rawId) {
    return NextResponse.json(
      { error: "Missing product ID" },
      { status: 400 }
    );
  }

  const id = Number(rawId); 

  try {
    const body = await req.json();

    const allowedFields = [
      "name",
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
      const value = body[key];

      if (value !== undefined && value !== "") {
        updates[key] = value;
      }
    }

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
      .maybeSingle(); 

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.log("Successfully updated product");
    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}