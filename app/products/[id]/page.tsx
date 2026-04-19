// app/products/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "./add-to-cart-button";
import { getProductMeta } from "@/lib/productMeta";

type DbProduct = {
  id: number;
  name: string;
  artist: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  quantity: number;
  image_url: string | null;
  category: string | null;
  genre: string | null;
  created_at: string | null;
};

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `$${safe.toFixed(2)}`;
}

function stockLabel(qty: number) {
  if (qty <= 0) return { text: "Sold out", cls: "bg-black text-white" };
  if (qty <= 3) return { text: "Low stock", cls: "bg-[#FF3B3B] text-black" };
  return { text: "In stock", cls: "bg-[#00F5D4] text-black" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const idNum = Number(id);
  if (!Number.isFinite(idNum)) notFound();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id,name,artist,description,price,sale_price,quantity,image_url,category,genre,created_at")
    .eq("id", idNum)
    .single();

  if (error || !data) notFound();

  const p = data as DbProduct;
  const meta = getProductMeta(p.name, p.artist);
  const stock = stockLabel(p.quantity);

  const desc =
    (p.description && p.description.trim()) ||
    meta.albumBlurb ||
    `${p.name} by ${p.artist}.`;

  const cover =
    p.image_url && p.image_url.trim().length > 0
      ? p.image_url
      : "/covers/placeholder.jpg";

  return (
    <section className="relative">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F6E7D3]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00F5D4] blur-3xl opacity-35" />
        <div className="absolute top-24 right-10 h-72 w-72 rounded-full bg-[#FF3B3B] blur-3xl opacity-20" />
      </div>

      {/* top bar */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/products"
          className="rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000] hover:bg-black hover:text-white"
        >
          ← Back to shop
        </Link>

        <div className="rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_0_#000]">
          Product #{p.id}
        </div>
      </div>

      {/* main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* LEFT: Cover + Quick Facts UNDER the cover */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
            <div className="relative">
              <div className="absolute left-4 top-4 z-10">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-widest ${stock.cls}`}
                >
                  <span className="h-2 w-2 rounded-full bg-black/50" />
                  {stock.text}
                </div>
              </div>

              {/* FULL COVER image */}
              <div className="bg-[#F6E7D3]">
                <img
                  src={cover}
                  alt={`${p.name} cover`}
                  className="h-auto w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Quick Facts BELOW cover */}
          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[8px_8px_0_0_#000]">
            <div className="text-xs font-black uppercase tracking-widest text-neutral-600">
              Quick facts
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border-2 border-black bg-[#FFD166] p-3">
                <div className="text-xs font-black uppercase opacity-70">Release</div>
                <div className="mt-1 font-black">{meta.releaseDate}</div>
              </div>

              <div className="rounded-2xl border-2 border-black bg-[#00BFA6] p-3 text-white shadow-[2px_2px_0_0_#000]">
                <div className="text-xs font-black uppercase opacity-90">Label</div>
                <div className="mt-1 font-black">{meta.label}</div>
              </div>

              <div className="rounded-2xl border-2 border-black bg-white p-3">
                <div className="text-xs font-black uppercase opacity-70">Category</div>
                <div className="mt-1 font-black">{p.category || "Vinyl"}</div>
              </div>

              <div className="rounded-2xl border-2 border-black bg-white p-3">
                <div className="text-xs font-black uppercase opacity-70">In stock</div>
                <div className="mt-1 font-black">{p.quantity}</div>
              </div>
            </div>

            {meta.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {meta.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border-2 border-black bg-black px-3 py-1 text-xs font-black uppercase tracking-wider text-white"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT: Title, price, add to cart, descriptions */}
        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">
                {p.name}
              </h1>
              <div className="mt-2 text-lg font-extrabold text-neutral-800">
                {p.artist}
              </div>
              {p.genre ? (
                <div className="mt-2 inline-flex rounded-full border-2 border-black bg-[#FFD166] px-4 py-2 text-xs font-black uppercase tracking-widest">
                  {p.genre}
                </div>
              ) : null}
            </div>

            {/* update to show sale price when sale price is not null */}
            <div className="shrink-0 rounded-2xl border-2 border-black bg-[#00BFA6] px-5 py-3 text-white shadow-[3px_3px_0_0_#000]">
              <div className="text-xs font-black uppercase opacity-90">Price</div>

              {p.sale_price ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold line-through opacity-70">
                    {money(p.price)}
                  </span>
                  <span className="text-2xl font-black">
                    {money(p.sale_price)}
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-black">
                  {money(p.price)}
                </div>
              )}
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <AddToCartButton
                product={{
                  id: p.id,
                  title: p.name,
                  artist: p.artist,
                  description: desc,
                  price: p.price,
                  quantity: p.quantity,
                  image_url: p.image_url ?? "",
                  category: p.category ?? "Vinyl",
                }}
              />
            </div>

            <Link
              href="/cart"
              className="rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0_0_#000] hover:bg-[#FF3B3B]"
            >
              Go to cart
            </Link>
          </div>

          {/* Description */}
          <div className="mt-6">
            <div className="text-xs font-black uppercase tracking-widest text-neutral-600">
              About this record
            </div>
            <p className="mt-2 text-sm font-semibold text-neutral-800 leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Track highlights */}
          <div className="mt-6 rounded-2xl border-2 border-black bg-[#F6E7D3] p-5">
            <div className="text-xs font-black uppercase tracking-widest text-neutral-700">
              Track highlights
            </div>

            {meta.highlightTracks?.length ? (
              <ul className="mt-3 space-y-2">
                {meta.highlightTracks.map((t) => (
                  <li
                    key={t}
                    className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-4 py-3 shadow-[2px_2px_0_0_#000]"
                  >
                    <span className="text-sm font-black">{t}</span>
                    <span className="text-xs font-black uppercase text-neutral-600">
                      highlight
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm font-bold text-neutral-700">
                No highlights set yet.
              </div>
            )}
          </div>

          {/* Artist bio */}
          <div className="mt-6">
            <div className="text-xs font-black uppercase tracking-widest text-neutral-600">
              About the artist
            </div>
            <p className="mt-2 text-sm font-semibold text-neutral-800 leading-relaxed">
              {meta.artistBio}
            </p>

            {meta.funFacts?.length ? (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {meta.funFacts.map((f) => (
                  <div
                    key={f}
                    className="rounded-2xl border-2 border-black bg-white p-4 text-sm font-bold shadow-[3px_3px_0_0_#000]"
                  >
                    {f}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}