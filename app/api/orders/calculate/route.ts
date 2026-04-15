import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type OrderItem = {
  product_id: number;
  quantity: number;
  price_at_purchase: number;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const body = await request.json();
    const items: OrderItem[] = Array.isArray(body?.items) ? body.items : [];
    const discountCode = String(body?.discountCode ?? "").trim().toUpperCase();

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No order items provided." },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const price = Number(item.price_at_purchase);

      if (!Number.isFinite(qty) || qty < 1 || !Number.isFinite(price) || price < 0) {
        throw new Error("Invalid order item data.");
      }

      return sum + qty * price;
    }, 0);

    let discountAmount = 0;

    if (discountCode) {
      const { data: codeRow, error: codeError } = await supabase
        .from("discount_codes")
        .select("code, percentage, active, expires_at")
        .eq("code", discountCode)
        .maybeSingle();

      if (codeError) {
        return NextResponse.json(
          { error: codeError.message },
          { status: 500 }
        );
      }

      if (!codeRow) {
        return NextResponse.json(
          { error: "Invalid discount code." },
          { status: 400 }
        );
      }

      if (!codeRow.active) {
        return NextResponse.json(
          { error: "This discount code is inactive." },
          { status: 400 }
        );
      }

      if (codeRow.expires_at) {
        const expiresAt = new Date(codeRow.expires_at);
        if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
          return NextResponse.json(
            { error: "This discount code has expired." },
            { status: 400 }
          );
        }
      }

      const percentage = Number(codeRow.percentage);
      if (Number.isFinite(percentage) && percentage > 0) {
        discountAmount = subtotal * (percentage / 100);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;

    return NextResponse.json({
      subtotal,
      discountAmount,
      tax,
      total,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to calculate totals." },
      { status: 500 }
    );
  }
}