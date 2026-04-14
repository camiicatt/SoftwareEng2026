"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/cartContext";
import Link from "next/link";

type RawProduct = any;

type Product = {
  id: number | string;
  title: string;
  artist: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
};

function normalizeProduct(p: RawProduct): Product {
  return {
    id: p.id ?? p.product_id ?? p.uuid ?? crypto.randomUUID(),
    title: String(p.title ?? p.name ?? p.product_name ?? "Untitled"),
    artist: String(p.artist ?? p.brand ?? p.maker ?? "Unknown Artist"),
    description: String(p.description ?? p.desc ?? ""),
    price: Number(p.price ?? p.cost ?? 0),
    quantity: Number(p.quantity ?? p.stock ?? p.qty ?? 0),
    image_url: String(p.image_url ?? p.image ?? p.cover_url ?? ""),
    category: String(p.category ?? p.type ?? "Vinyl"),
  };
}

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `$${safe.toFixed(2)}`;
}

function badgeText(qty: number) {
  if (qty <= 0) return "Sold out";
  if (qty <= 3) return "Low stock";
  return "In stock";
}

// Sunset Vinyl palette + readable contrast
function badgeStyle(qty: number) {
  if (qty <= 0) return "bg-neutral-900 text-white border-neutral-900";
  if (qty <= 3) return "bg-[#FF6B6B] text-neutral-950 border-neutral-950";
  return "bg-[#2EC4B6] text-neutral-950 border-neutral-950";
}

function ProductCard({ p, onAddToCart  }: { p: Product; onAddToCart: (product: Product) => void; }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.14)]">
      {/* status badge */}
      <div className="absolute left-3 top-3 z-10">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${badgeStyle(
            p.quantity
          )}`}
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {badgeText(p.quantity)}
        </div>
      </div>

      {/* cover */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-950">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-center text-white/90">
            <div>
              <div className="text-xs font-black uppercase tracking-widest">No cover</div>
              <div className="mt-2 text-xs font-semibold text-white/70">
                Add <span className="font-black">image_url</span> in DB
              </div>
            </div>
          </div>
        )}

        {/* sunset overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,214,153,0.45),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,107,107,0.30),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      </div>

      {/* content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black uppercase tracking-tight text-neutral-950 sm:text-lg">
              {p.title}
            </h3>
            <p className="truncate text-sm font-extrabold text-neutral-700">
              {p.artist}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-black/10 bg-[#2EC4B6]/90 px-3 py-1 text-sm font-black text-neutral-950 shadow-[0_6px_16px_rgba(0,0,0,0.10)]">
            {money(p.price)}
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-neutral-700 sm:text-sm">
          {p.description || "No description yet."}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="rounded-full border border-black/10 bg-[#FFD6A5] px-3 py-1 text-[11px] font-black uppercase text-neutral-950">
            {p.category}
          </div>

          <div className="text-xs font-black text-neutral-900">
            Qty: <span className="text-neutral-700">{p.quantity}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(p)}
            disabled={p.quantity <= 0}
            className="rounded-2xl border border-black/10 bg-neutral-950 px-3 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none"
          >
            Add
          </button>

          <Link
            href={`/products/${p.id}`}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-center text-sm font-black uppercase tracking-wide text-neutral-950 shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition-all hover:-translate-y-0.5 hover:bg-[#FF6B6B] hover:text-neutral-950"
          >
            View
          </Link>
        </div>
      </div>

      {/* subtle frame */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/10" />
    </article>
  );
}

export default function ProductsClient() {
    const { addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "stock_desc">("stock_desc");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [category, setCategory] = useState<string>("All");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (sort) params.set("sort", sort);
    if (inStockOnly) params.set("inStock", "1");
    if (category !== "All") params.set("category", category);
    return params.toString();
  }, [q, sort, inStockOnly, category]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`/api/products/all?${queryString}`, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Backend error ${res.status}${text ? `: ${text}` : ""}`);
        }

        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data;
        if (!Array.isArray(arr)) throw new Error("Backend did not return an array");

        const normalized = arr.map(normalizeProduct);

        // keep your fallback for demos if DB is empty
        const fallback: Product[] = [
          {
            id: "900001",
            title: "Thriller",
            artist: "Michael Jackson",
            description: "Pop legend. Full of hits.",
            price: 29.99,
            quantity: 7,
            image_url: "/covers/thriller.jpg",
            category: "Vinyl",
          },
          {
            id: "900002",
            title: "After Hours",
            artist: "The Weeknd",
            description: "Modern classic. Dark, cinematic, iconic.",
            price: 28.5,
            quantity: 5,
            image_url: "/covers/after-hours.jpg",
            category: "Vinyl",
          },
        ];

        let out = normalized.length ? normalized : fallback;

        // client-side guard filters (in case backend ignores params)
        if (q.trim()) {
          const qq = q.toLowerCase();
          out = out.filter((p) =>
            `${p.title} ${p.artist} ${p.description}`.toLowerCase().includes(qq)
          );
        }
        if (category !== "All") out = out.filter((p) => p.category === category);
        if (inStockOnly) out = out.filter((p) => p.quantity > 0);

        if (sort === "price_desc") out.sort((a, b) => b.price - a.price);
        else if (sort === "price_asc") out.sort((a, b) => a.price - b.price);
        else out.sort((a, b) => b.quantity - a.quantity);

        if (!cancelled) setItems(out);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message ?? "Failed to load");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    items.forEach((p) => set.add(p.category || "Vinyl"));
    return Array.from(set);
  }, [items]);

  return (
    <section className="relative">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#FFF3E6]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#111_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute -top-40 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#FFD6A5] blur-3xl opacity-70" />
        <div className="absolute top-12 right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[#FF6B6B] blur-3xl opacity-35" />
        <div className="absolute bottom-0 left-[-7rem] h-[22rem] w-[22rem] rounded-full bg-[#2EC4B6] blur-3xl opacity-30" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* hero */}
        <header className="rounded-3xl border border-black/10 bg-neutral-950 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
                <span className="h-2 w-2 rounded-full bg-[#FF6B6B]" />
                Sunset Vinyl Drop
              </div>

              <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl lg:text-6xl">
                Find your next{" "}
                <span className="relative inline-block">
                  spin
                  <span className="absolute -bottom-1 left-0 h-[10px] w-full bg-[#FFD6A5]/70" />
                </span>
              </h1>

              <p className="mt-3 text-sm font-semibold text-white/85 sm:text-base">
                Grab what’s in stock!
              </p>
            </div>

            {/* controls */}
            <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-[28rem] lg:grid-cols-1">
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, artist, description"
                  className="w-full bg-transparent px-3 py-2 text-sm font-semibold text-white placeholder:text-white/60 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="rounded-2xl border-2 border-black bg-white px-3 py-3 text-sm font-black text-black outline-none"
                >
                  <option value="stock_desc">Availability</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-2xl border-2 border-black bg-white px-3 py-3 text-sm font-black text-black outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2EC4B6]" />
                  In stock only
                </span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-5 w-5 accent-[#2EC4B6]"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 text-sm font-black text-white/90">Loading…</div>
          ) : err ? (
            <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm font-semibold text-white">
              <div className="font-black">Couldn’t load products.</div>
              <div className="mt-1 text-white/80">{err}</div>
            </div>
          ) : null}
        </header>

        {/* grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {items.map((p) => (
            <ProductCard key={String(p.id)} p={p} onAddToCart={addToCart}  />
          ))}
        </div>

        {!loading && !err && items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-[0_14px_40px_rgba(0,0,0,0.10)] backdrop-blur">
            <div className="text-2xl font-black uppercase text-neutral-950">No items found</div>
            <div className="mt-2 text-sm font-semibold text-neutral-700">
              Try a different search or reset filters.
            </div>
            <button
              onClick={() => {
                setQ("");
                setCategory("All");
                setInStockOnly(false);
                setSort("stock_desc");
              }}
              className="mt-5 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5"
            >
              Reset
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}