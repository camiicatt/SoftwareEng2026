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
    return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function ProductCard({
    p,
    onHover,
    onEdit,
}: {
    p: Product;
    onHover: (p: Product) => void;
    onEdit: (p: Product) => void;
}) {
    return (
        <div
            onMouseEnter={() => onHover(p)}
            className="cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow hover:scale-105 transition-transform relative"
        >
            <img
                src={p.image_url}
                alt={p.title}
                className="w-full h-40 object-cover rounded-lg"
                loading="lazy"
            />
            <div className="mt-2 font-black text-sm">{p.title}</div>
            <div className="text-xs font-semibold text-neutral-700">{p.artist}</div>
            <div className="mt-1 text-xs font-bold text-neutral-900">{money(p.price)}</div>
            <button
                onClick={() => onEdit(p)}
                className="absolute top-2 right-2 border-2 border-black px-3 py-1 text-xs font-black uppercase bg-[#EDEDED] hover:bg-[#88A7A9] hover:text-white rounded"
            >
                Edit
            </button>
        </div>
    );
}

export default function ProductsPageLivePreview() {
    const { addToCart } = useCart();
    const [allItems, setAllItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [hovered, setHovered] = useState<Product | null>(null);
    const [editing, setEditing] = useState<Product | null>(null);

    // Filters
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("title");

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setErr(null);
            try {
                const res = await fetch(`/api/products/all`, { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to load products");
                const data = await res.json();
                const arr = Array.isArray(data) ? data : data?.data;
                const normalized = arr.map(normalizeProduct);
                if (!cancelled) setAllItems(normalized);
            } catch (e: any) {
                if (!cancelled) {
                    setErr(e.message ?? "Error loading products");
                    setAllItems([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const categories = useMemo(() => {
        const set = new Set(allItems.map((p) => p.category));
        return ["All", ...Array.from(set).sort()];
    }, [allItems]);

    const items = useMemo(() => {
        let filtered = allItems;
        if (category !== "All") filtered = filtered.filter((p) => p.category === category);

        const sorted = [...filtered];
        if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
        if (sort === "price") sorted.sort((a, b) => a.price - b.price);
        if (sort === "-price") sorted.sort((a, b) => b.price - a.price);

        return sorted;
    }, [allItems, category, sort]);

    const liveHovered = hovered ? items.find((p) => p.id === hovered.id) ?? hovered : null;

    const handleSave = async () => {
        if (!editing) return;
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black uppercase">Edit Products</h1>
                <a className="underline underline-offset-4" href="/admin">
                    Back to Dashboard
                </a>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Filters + Grid */}
                <div className="flex-1">
                    <div className="flex gap-4 mb-4">
                        {/* Category dropdown */}
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-1/2 border rounded-lg px-3 py-2"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>

                        {/* Sort dropdown */}
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-1/2 border rounded-lg px-3 py-2"
                        >
                            <option value="title">Title</option>
                            <option value="price">Price (Low → High)</option>
                            <option value="-price">Price (High → Low)</option>
                        </select>
                    </div>

                    {loading ? (
                        <div>Loading products...</div>
                    ) : err ? (
                        <div className="text-red-500">{err}</div>
                    ) : items.length === 0 ? (
                        <div>No products found</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {items.map((p) => (
                                <ProductCard key={String(p.id)} p={p} onHover={setHovered} onEdit={setEditing}/>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Live Preview + Edit Details */}
                {editing || liveHovered ? (
                    <div className="w-full lg:w-96 border rounded-2xl p-4 shadow bg-white transition-all relative">
                        <div className="absolute -top-3 left-4 bg-[#FFD6A5] px-4 py-2 text-[10px] font-black uppercase rounded-full shadow">
                            {editing ? "Edit Product" : "Preview"}
                        </div>
                        {(editing || liveHovered) && (
                            <>
                                <img
                                    src={(editing || liveHovered)?.image_url}
                                    alt={(editing || liveHovered)?.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                {editing ? (
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-15 text-right font-bold">Title:</span>
                                            <input
                                                className="border rounded px-2 py-1"
                                                value={editing.title}
                                                onChange={(e) =>
                                                    setEditing({ ...editing, title: e.target.value })
                                                }
                                                placeholder="Title"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-15 text-right font-bold">Artist:</span>
                                            <input
                                                className="border rounded px-2 py-1"
                                                value={editing.artist}
                                                onChange={(e) =>
                                                    setEditing({ ...editing, artist: e.target.value })
                                                }
                                                placeholder="Artist"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-15 text-right font-bold">Desc:</span>
                                            <textarea
                                                className="border rounded px-2 py-1"
                                                value={editing.description}
                                                onChange={(e) =>
                                                    setEditing({ ...editing, description: e.target.value })
                                                }
                                                placeholder="Description"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-15 text-right font-bold">Price:</span>
                                            <input
                                                type="number"
                                                className="border rounded px-2 py-1"
                                                value={editing.price}
                                                onChange={(e) =>
                                                    setEditing({ ...editing, price: Number(e.target.value) })
                                                }
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-15 text-right font-bold">Qty:</span>
                                            <input
                                                type="number"
                                                className="border rounded px-2 py-1"
                                                value={editing.quantity}
                                                onChange={(e) =>
                                                    setEditing({ ...editing, quantity: Number(e.target.value) })
                                                }
                                                placeholder="Quantity"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            className="mt-2 w-full rounded-lg border-2 border-black px-3 py-2 text-s font-black uppercase bg-[#EDEDED] hover:bg-[#88A7A9] hover:text-white"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditing(null)}
                                            className="mt-2 w-full rounded-lg border-2 border-black px-3 py-2 text-s font-black uppercase bg-[#EDEDED] hover:bg-[#D97B66] hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="mt-4 font-black text-xl">{liveHovered?.title}</h2>
                                        <p className="text-sm font-bold text-neutral-700">
                                            {liveHovered?.artist}
                                        </p>
                                        <p className="mt-2 text-xs text-neutral-600">
                                            {liveHovered?.description}
                                        </p>
                                        <div className="mt-3 flex justify-between items-center">
                                            <div className="text-lg font-black">
                                                {money(liveHovered?.price ?? 0)}
                                            </div>
                                            <div className="text-xs font-bold">
                                                {liveHovered?.quantity} in stock
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => liveHovered && addToCart(liveHovered)}
                                            disabled={liveHovered?.quantity! <= 0}
                                            className="mt-4 w-full rounded-lg bg-black text-white py-2 font-black disabled:bg-neutral-400 disabled:cursor-not-allowed"
                                        >
                                            Add to Cart
                                        </button>
                                        <Link
                                            href={`/products/${liveHovered?.id}`}
                                            className="mt-2 inline-block w-full text-center rounded-lg border border-black py-2 font-black text-black"
                                        >
                                            View Details
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}