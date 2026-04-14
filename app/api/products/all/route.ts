import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function fetchFromBackend(request: Request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();

  const res = await fetch(`http://localhost:5000/products/all${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Backend error ${res.status}`, details: text },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data ?? []);
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env missing, don't crash the whole shop
  if (!url || !key) {
    return fetchFromBackend(request);
  }

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase
      .from("products")
      .select("id,name,artist,description,price,quantity,image_url,category,genre,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      // Supabase query failed → fallback to backend so UI still works
      return fetchFromBackend(request);
    }

    return NextResponse.json(data ?? []);
  } catch {
    // Any runtime error → fallback to backend
    return fetchFromBackend(request);
  }
}