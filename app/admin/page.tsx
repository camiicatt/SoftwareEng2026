"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientBrowser } from "@/lib/supabase/client";

type ProductRow = {
  id: number | string;
  name: string;
  artist: string | null;
  description: string | null;
  price: number | null;
  quantity: number | null;
  category: string | null;
  genre: string | null;
  image_url: string | null;
  created_at: string;
};

const GENRE_OPTIONS = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Jazz",
  "Soul",
  "Funk",
  "Electronic",
  "Indie",
  "Metal",
  "Classical",
  "Country",
  "Reggae",
  "Latin",
  "Soundtrack",
  "Other",
] as const;

export default function AdminDashboard() {
  const supabase = createClientBrowser();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [category, setCategory] = useState("Vinyl");

  const [genreSelect, setGenreSelect] = useState<string>("Indie");
  const [customGenre, setCustomGenre] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [recent, setRecent] = useState<ProductRow[]>([]);

  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountExpiry, setDiscountExpiry] = useState("");
  const [discountStatus, setDiscountStatus] = useState("");
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);

  const [imageUrl, setImageUrl] = useState("");

  const resolvedGenre = useMemo(() => {
    if (genreSelect === "Other") return customGenre.trim();
    return genreSelect.trim();
  }, [genreSelect, customGenre]);

  async function loadRecent() {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,artist,description,price,quantity,category,genre,image_url,created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) setRecent(data as ProductRow[]);
  }

  async function loadDiscountCodes() {
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .order("code", { ascending: true });

    if (!error && data) setDiscountCodes(data);
  }

  async function addDiscountCode(e: React.SyntheticEvent) {
    e.preventDefault();

    if (!discountCode.trim()) {
      return setDiscountStatus("Code is required.");
    }

    const pct = Number(discountPercent);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
      return setDiscountStatus("Percentage must be a valid number > 0 and < 100.");
    }

    const { error } = await supabase.from("discount_codes").insert({
      code: discountCode.trim().toUpperCase(),
      percentage: pct,
      active: true,
      expires_at: discountExpiry || null,
    });

    if (error) return setDiscountStatus(`:( ${error.message}`);

    setDiscountStatus("Discount code added!");
    setDiscountCode("");
    setDiscountPercent("");
    setDiscountExpiry("");
    await loadDiscountCodes();
  }

  async function toggleDiscountCode(code: string, currentlyActive: boolean) {
    await supabase
      .from("discount_codes")
      .update({ active: !currentlyActive })
      .eq("code", code);

    await loadDiscountCodes();
  }

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const userEmail = userRes.user?.email ?? null;
      setEmail(userEmail);

      if (!userEmail) {
        window.location.assign("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("email")
        .eq("email", userEmail)
        .maybeSingle();

      const ok = !error && !!data;
      setIsAdmin(ok);
      setLoading(false);

      if (ok) {
        await loadRecent();
        await loadDiscountCodes();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addVinyl(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!name.trim()) return setStatus("Name is required.");
    if (!resolvedGenre) return setStatus("Pick a genre (or type a custom genre).");

    const priceNum = price.trim() === "" ? 0 : Number(price);
    const qtyNum = quantity.trim() === "" ? 0 : Number(quantity);

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return setStatus("Price must be a valid number ≥ 0.");
    }

    if (!Number.isFinite(qtyNum) || qtyNum < 0) {
      return setStatus("Quantity must be a valid number ≥ 0.");
    }

    setSaving(true);
    setStatus("");

    try {
      let image_url: string | null = null;

      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        artist: artist.trim() || null,
        description: description.trim() || null,
        price: priceNum,
        quantity: qtyNum,
        category: category.trim() || "Vinyl",
        genre: resolvedGenre || null,
        image_url: imageUrl.trim() || null,
      });

      if (error) throw new Error(error.message);

      setName("");
      setArtist("");
      setDescription("");
      setPrice("");
      setQuantity("1");
      setCategory("Vinyl");
      setGenreSelect("Indie");
      setCustomGenre("");
      setFile(null);

      setStatus("Product added to inventory!");
      await loadRecent();
    } catch (err: any) {
      setStatus(`:( ${err?.message ?? "Something went wrong"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="inline-block border-4 border-black bg-white px-4 py-3 font-black shadow-[6px_6px_0_0_#000]">
          Loading…
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="space-y-3 border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
          <h1 className="text-2xl font-black uppercase">Not Authorized</h1>
          <p className="text-sm font-semibold">Signed in as: {email}</p>
          <a
            className="inline-block border-2 border-black bg-[#F2D23C] px-4 py-2 font-black uppercase shadow-[4px_4px_0_0_#000]"
            href="/admin/login"
          >
            Switch Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-5 py-8">
      <div className="border-4 border-black bg-[#FFF3E6] p-6 shadow-[8px_8px_0_0_#000]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-black/70">
              Store Control Panel
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm font-semibold text-black/75">
              Signed in as: {email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/shop"
              className="border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-widest text-[#FFF3E6] shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5"
            >
              View Store
            </Link>
            <Link
              href="/admin/customers"
              className="border-2 border-black bg-[#CFE8F3] px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5"
            >
              View Accounts
            </Link>
            <Link
              href="/admin/orders"
              className="border-2 border-black bg-[#F2D23C] px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5"
            >
              View Orders
            </Link>
            <Link
              href="/admin/products"
              className="border-2 border-black bg-[#D99A73] px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5"
            >
              Edit Products
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="border-4 border-black bg-[#CFE8F3] p-6 shadow-[8px_8px_0_0_#000]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  Add Product
                </h2>
                <p className="text-sm font-semibold text-black/75">
                  Add a new item to the products table.
                </p>
              </div>

              <div className="inline-flex w-fit border-2 border-black bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest">
                products
              </div>
            </div>

            <form onSubmit={addVinyl} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Name
                  </label>
                  <input
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                    placeholder="Album / Vinyl name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Artist
                  </label>
                  <input
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                    placeholder="Artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Price
                  </label>
                  <input
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                    placeholder="29.99"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Quantity
                  </label>
                  <input
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                    placeholder="10"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Category
                  </label>
                  <select
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-black uppercase outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Vinyl">Vinyl</option>
                    <option value="Instrument">Instrument</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Genre
                  </label>
                  <select
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-black uppercase outline-none"
                    value={genreSelect}
                    onChange={(e) => setGenreSelect(e.target.value)}
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  {genreSelect === "Other" ? (
                    <input
                      className="mt-2 w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                      placeholder="Type custom genre"
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                    />
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed border-black bg-[#EAF4F4] px-3 py-4">
                  <input
                    type="text"
                    placeholder="Paste image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2.5 font-semibold"
                  />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-black/65">
                    Upload bucket: vinyl-images
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-black/80">
                  Description
                </label>
                <textarea
                  className="min-h-[120px] w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                  placeholder="Short description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                disabled={saving}
                className="w-full border-2 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-widest text-[#FFF3E6] shadow-[6px_6px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[10px_10px_0_0_#000] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0_0_#000] sm:w-auto"
              >
                {saving ? "Adding…" : "Add Product"}
              </button>
            </form>

            {status ? (
              <div className="mt-5 border-2 border-black bg-white p-3 font-semibold">
                {status}
              </div>
            ) : null}
          </div>

          <div className="border-4 border-black bg-[#CFE8F3] p-6 shadow-[8px_8px_0_0_#000]">
            <div className="mb-5">
              <h2 className="text-xl font-black uppercase tracking-tight">
                Manage Discount Codes
              </h2>
              <p className="text-sm font-semibold text-black/75">
                Create promos and toggle them on or off.
              </p>
            </div>

            <form onSubmit={addDiscountCode} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Code
                  </label>
                  <input
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                    placeholder="e.g. VINYL10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Percentage Off
                  </label>
                  <input
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                    placeholder="10"
                    inputMode="numeric"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-black/80">
                    Expires At
                  </label>
                  <input
                    className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                    type="date"
                    value={discountExpiry}
                    onChange={(e) => setDiscountExpiry(e.target.value)}
                  />
                </div>
              </div>

              <button className="w-full border-2 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-widest text-[#FFF3E6] shadow-[6px_6px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[10px_10px_0_0_#000] sm:w-auto">
                Add Discount Code
              </button>
            </form>

            {discountStatus ? (
              <div className="mt-5 border-2 border-black bg-white p-3 font-semibold">
                {discountStatus}
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest">
                Existing Codes
              </h3>

              {discountCodes.length === 0 ? (
                <div className="border-2 border-black bg-white p-4 text-sm font-semibold">
                  No discount codes yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {discountCodes.map((dc) => (
                    <div
                      key={dc.code}
                      className="flex flex-col gap-3 border-2 border-black bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="font-black uppercase">{dc.code}</div>
                        <div className="text-xs font-semibold text-black/70">
                          {dc.percentage}% off
                          {dc.expires_at
                            ? ` • expires ${dc.expires_at.slice(0, 10)}`
                            : " • no expiration"}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleDiscountCode(dc.code, dc.active)}
                        className={`border-2 border-black px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0_0_#000] ${
                          dc.active ? "bg-[#88D498]" : "bg-[#F7C59F]"
                        }`}
                      >
                        {dc.active ? "Active" : "Inactive"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-4 border-black bg-[#FFF3E6] p-6 shadow-[8px_8px_0_0_#000]">
          <div className="mb-5">
            <h2 className="text-xl font-black uppercase tracking-tight">
              Recently Added
            </h2>
            <p className="text-sm font-semibold text-black/75">
              Latest products currently in inventory.
            </p>
          </div>

          {recent.length === 0 ? (
            <div className="border-2 border-black bg-white p-4 font-semibold">
              No products yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recent.map((p) => (
                <div
                  key={String(p.id)}
                  className="border-2 border-black bg-white p-3 shadow-[5px_5px_0_0_#000]"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-44 w-full border-2 border-black object-cover"
                    />
                  ) : (
                    <div className="h-44 w-full border-2 border-black bg-[#EAF4F4]" />
                  )}

                  <div className="mt-3">
                    <div className="truncate text-base font-black uppercase">
                      {p.name}
                    </div>
                    <div className="truncate text-sm font-semibold text-black/75">
                      {p.artist || "Unknown Artist"}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase">
                    <span className="border-2 border-black bg-[#FFD166] px-2 py-1">
                      {p.genre || "No Genre"}
                    </span>
                    <span className="border-2 border-black bg-[#CFE8F3] px-2 py-1">
                      {p.category || "Vinyl"}
                    </span>
                    <span className="ml-auto text-xs font-black text-black/70">
                      Qty {p.quantity ?? 0}
                    </span>
                  </div>

                  <div className="mt-3 text-lg font-black">
                    ${Number(p.price ?? 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}