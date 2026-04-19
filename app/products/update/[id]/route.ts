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

  if (!Number.isFinite(id)) {
    return NextResponse.json(
      { error: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const updates: Record<string, any> = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.artist !== undefined) updates.artist = String(body.artist).trim();
    if (body.description !== undefined)
      updates.description = String(body.description).trim();
    if (body.image_url !== undefined)
      updates.image_url = String(body.image_url).trim();
    if (body.category !== undefined)
      updates.category = String(body.category).trim();
    if (body.genre !== undefined) updates.genre = String(body.genre).trim();

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { error: "Price must be a valid number >= 0" },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    if (body.quantity !== undefined) {
      const quantity = Number(body.quantity);
      if (!Number.isInteger(quantity) || quantity < 0) {
        return NextResponse.json(
          { error: "Quantity must be an integer >= 0" },
          { status: 400 }
        );
      }
      updates.quantity = quantity;
    }

    // sale_price supports null to remove the sale
    if (body.sale_price !== undefined) {
      if (body.sale_price === null || body.sale_price === "") {
        updates.sale_price = null;
      } else {
        const salePrice = Number(body.sale_price);

        if (!Number.isFinite(salePrice) || salePrice < 0) {
          return NextResponse.json(
            { error: "Sale price must be a valid number >= 0" },
            { status: 400 }
          );
        }

        updates.sale_price = salePrice;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // If both are present in this request, validate relationship here too
    const effectivePrice =
      updates.price !== undefined ? updates.price : Number(body.price);
    const effectiveSalePrice = updates.sale_price;

    if (
      effectiveSalePrice !== undefined &&
      effectiveSalePrice !== null &&
      Number.isFinite(effectivePrice) &&
      effectiveSalePrice >= effectivePrice
    ) {
      return NextResponse.json(
        { error: "Sale price must be less than regular price" },
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

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}