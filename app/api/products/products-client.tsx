"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/cartContext";
import Link from "next/link";

type RawProduct = any;

type Product = {
  id: string;
  title: string;
  artist: string;
  description: string;
  price: number;
  sale_price: number | null;
  quantity: number;
  image_url: string;
  category: string;
};

function normalizeProduct(p: RawProduct): Product {
  return {
    id: String(p.id ?? p.product_id),
    title: String(p.title ?? p.name ?? p.product_name ?? "Untitled"),
    artist: String(p.artist ?? p.brand ?? p.maker ?? "Unknown Artist"),
    description: String(p.description ?? p.desc ?? ""),
    price: Number(p.price ?? p.cost ?? 0),
    sale_price:
      p.sale_price === null || p.sale_price === undefined || p.sale_price === ""
        ? null
        : Number(p.sale_price),
    quantity: Number(p.quantity ?? p.stock ?? p.qty ?? 0),
    image_url: String(p.image_url ?? p.image ?? p.cover_url ?? ""),
    category: String(p.category ?? p.type ?? "Vinyl"),
  };
}

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `$${safe.toFixed(2)}`;
}

function isOnSale(p: Product) {
  return (
    p.sale_price !== null &&
    Number.isFinite(p.sale_price) &&
    p.sale_price < p.price
  );
}

function badgeText(qty: number) {
  if (qty <= 0) return "Sold Out";
  if (qty <= 3) return "Low Stock";
  return "In Stock";
}

function badgeStyle(qty: number) {
  if (qty <= 0) return "bg-black text-[#FFF3E6]";
  if (qty <= 3) return "bg-[#FF8A80] text-black";
  return "bg-[#A8DADC] text-black";
}

function ProductCard({
  p,
  onAddToCart,
}: {
  p: Product;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <article className="group relative border-4 border-black bg-white shadow-[6px_6px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000]">
      <div className="absolute left-3 top-3 z-10">
        <div
          className={`border-2 border-black px-3 py-1 text-[11px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#000] ${badgeStyle(
            p.quantity
          )}`}
        >
          {badgeText(p.quantity)}
        </div>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden border-b-4 border-black bg-[#EAF4F4]">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-center">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-black">
                No Cover
              </div>
              <div className="mt-2 text-xs font-semibold text-black/70">
                Add image_url in DB
              </div>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_45%)]" />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black uppercase tracking-tight text-black sm:text-lg">
              {p.title}
            </h3>
            <p className="truncate text-sm font-bold text-black/75">{p.artist}</p>
          </div>

          <div className="shrink-0 text-right">
            {isOnSale(p) ? (
              <div className="space-y-1">
                <div className="border-2 border-black bg-[#FF8A80] px-3 py-1 text-sm font-black text-black shadow-[3px_3px_0_0_#000]">
                  {money(p.sale_price!)}
                </div>
                <div className="text-xs font-black text-black/50 line-through">
                  {money(p.price)}
                </div>
              </div>
            ) : (
              <div className="border-2 border-black bg-[#F2D23C] px-3 py-1 text-sm font-black text-black shadow-[3px_3px_0_0_#000]">
                {money(p.price)}
              </div>
            )}
          </div>
        </div>

        <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-black/75 sm:text-sm">
          {p.description || "No description yet."}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border-2 border-black bg-[#FFD6A5] px-2 py-1 text-[11px] font-black uppercase">
            {p.category}
          </span>

          {isOnSale(p) && (
            <span className="border-2 border-black bg-[#FF8A80] px-2 py-1 text-[11px] font-black uppercase">
              On Sale
            </span>
          )}

          <span className="ml-auto text-xs font-black uppercase text-black/75">
            Qty {p.quantity}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onAddToCart(p)}
            disabled={p.quantity <= 0}
            className="border-2 border-black bg-black px-3 py-2 text-sm font-black uppercase tracking-widest text-[#FFF3E6] shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none"
          >
            Add
          </button>

          <Link
            href={`/products/${p.id}`}
            className="border-2 border-black bg-[#CFE8F3] px-3 py-2 text-center text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[6px_6px_0_0_#000]"
          >
            View
          </Link>
        </div>
      </div>
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

        const fallback: Product[] = [
          {
            id: "900001",
            title: "Thriller",
            artist: "Michael Jackson",
            description: "Pop legend. Full of hits.",
            price: 29.99,
            sale_price: null,
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
            sale_price: 22.99,
            quantity: 5,
            image_url: "/covers/after-hours.jpg",
            category: "Vinyl",
          },
        ];

        let out = normalized.length ? normalized : fallback;

        if (q.trim()) {
          const qq = q.toLowerCase();
          out = out.filter((p) =>
            `${p.title} ${p.artist} ${p.description}`.toLowerCase().includes(qq)
          );
        }

        if (category !== "All") out = out.filter((p) => p.category === category);
        if (inStockOnly) out = out.filter((p) => p.quantity > 0);

        if (sort === "price_desc") {
          out.sort((a, b) => {
            const aPrice = isOnSale(a) ? a.sale_price! : a.price;
            const bPrice = isOnSale(b) ? b.sale_price! : b.price;
            return bPrice - aPrice;
          });
        } else if (sort === "price_asc") {
          out.sort((a, b) => {
            const aPrice = isOnSale(a) ? a.sale_price! : a.price;
            const bPrice = isOnSale(b) ? b.sale_price! : b.price;
            return aPrice - bPrice;
          });
        } else {
          out.sort((a, b) => b.quantity - a.quantity);
        }

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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#FFF3E6]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-4 border-black bg-[#CFE8F3] p-6 shadow-[8px_8px_0_0_#000] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center border-2 border-black bg-black px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FFF3E6] shadow-[4px_4px_0_0_#000]">
                Sunset Vinyl Collection
              </div>

              <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-tight text-black sm:text-5xl lg:text-6xl">
                Find your next spin
              </h1>

              <p className="mt-3 text-sm font-semibold text-black/75 sm:text-base">
                Browse records, gear, and everything currently in stock.
              </p>
            </div>

            <div className="grid w-full gap-3 lg:w-[30rem]">
              <div className="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, artist, description"
                  className="w-full bg-transparent px-4 py-3 text-sm font-semibold text-black placeholder:text-black/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "price_asc" | "price_desc" | "stock_desc")}
                  className="border-2 border-black bg-white px-3 py-3 text-sm font-black uppercase text-black outline-none shadow-[4px_4px_0_0_#000]"
                >
                  <option value="stock_desc">Availability</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-2 border-black bg-white px-3 py-3 text-sm font-black uppercase text-black outline-none shadow-[4px_4px_0_0_#000]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-between gap-3 border-2 border-black bg-[#F2D23C] px-4 py-3 text-sm font-black uppercase text-black shadow-[4px_4px_0_0_#000]">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-5 w-5 accent-black"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 border-2 border-black bg-white px-4 py-3 text-sm font-black shadow-[4px_4px_0_0_#000]">
              Loading…
            </div>
          ) : err ? (
            <div className="mt-5 border-2 border-black bg-[#FFB4A2] p-4 text-sm font-semibold shadow-[4px_4px_0_0_#000]">
              <div className="font-black uppercase">Couldn’t load products</div>
              <div className="mt-1">{err}</div>
            </div>
          ) : null}
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {items.map((p) => (
            <ProductCard key={String(p.id)} p={p} onAddToCart={addToCart} />
          ))}
        </div>

        {!loading && !err && items.length === 0 ? (
          <div className="mt-10 border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0_0_#000]">
            <div className="text-2xl font-black uppercase text-black">No Items Found</div>
            <div className="mt-2 text-sm font-semibold text-black/75">
              Try a different search or reset your filters.
            </div>
            <button
              onClick={() => {
                setQ("");
                setCategory("All");
                setInStockOnly(false);
                setSort("stock_desc");
              }}
              className="mt-5 border-2 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-widest text-[#FFF3E6] shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000]"
            >
              Reset Filters
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}