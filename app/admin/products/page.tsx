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


// Helper functions for preview display
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

function money(n: number) {
    return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

// For viewing all products to choose to edit
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

// For the live preview panel
function PreviewProductCard({ p }: { p: Product }) {
    return (
        <article className="relative border-4 border-black bg-white shadow-[6px_6px_0_0_#000]">

            {/* Badge */}
            <div className="absolute left-3 top-3 z-10">
                <div
                    className={`border-2 border-black px-3 py-1 text-[11px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#000] ${badgeStyle(
                        p.quantity
                    )}`}
                >
                    {badgeText(p.quantity)}
                </div>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden border-b-4 border-black bg-[#EAF4F4]">
                {p.image_url ? (
                    <img
                        src={p.image_url}
                        alt={p.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs font-black">
                        No Cover
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-3 p-4">
                <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-black uppercase">
                            {p.title}
                        </h3>
                        <p className="truncate text-sm font-bold text-black/75">
                            {p.artist}
                        </p>
                    </div>

                    <div className="border-2 border-black bg-[#F2D23C] px-3 py-1 text-sm font-black shadow-[3px_3px_0_0_#000]">
                        {money(p.price)}
                    </div>
                </div>

                <p className="line-clamp-2 text-xs font-semibold text-black/75">
                    {p.description || "No description yet."}
                </p>

                <div className="flex items-center gap-2">
                    <span className="border-2 border-black bg-[#FFD6A5] px-2 py-1 text-[11px] font-black uppercase">
                        {p.category}
                    </span>

                    <span className="ml-auto text-xs font-black uppercase text-black/75">
                        Qty {p.quantity}
                    </span>
                </div>

                {/* Disabled buttons (visual only) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        disabled
                        className="border-2 border-black bg-neutral-300 px-3 py-2 text-sm font-black uppercase"
                    >
                        Add
                    </button>

                    <div className="border-2 border-black bg-[#CFE8F3] px-3 py-2 text-center text-sm font-black uppercase">
                        View
                    </div>
                </div>
            </div>
        </article>
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

        try {
            const res = await fetch(`/api/products/${editing.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: editing.title,
                    artist: editing.artist,
                    description: editing.description,
                    price: editing.price,
                    quantity: editing.quantity,
                    image_url: editing.image_url,
                    category: editing.category,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || "Failed to update product");
            }

            const updated = await res.json();

            // live UI update
            setAllItems((prev) =>
                prev.map((p) => (p.id === updated.id ? normalizeProduct(updated) : p))
            );

            setEditing(null);
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Something went wrong");
        }
    };

    return (
        <div className="max-screen-xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black uppercase">Edit Products</h1>
                <a className="underline underline-offset-4" href="/admin">
                    Back to Dashboard
                </a>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
                {/* Left: Filters + Grid */}
                <div className="h-full overflow-y-auto pr-2">
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
                                <ProductCard key={String(p.id)} p={p} onHover={setHovered} onEdit={setEditing} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Live preview + edit panel */}
                {editing && (
                    <div className="h-full sticky top-0">
                        <div className="h-full flex flex-col gap-6">
                        {/* Live Preview */}
                        <div className="max-w-xs mx-auto border-4 border-black bg-[#FFF3E6] p-5 shadow-[6px_6px_0_0_#000]">
                            <h2 className="text-lg font-black uppercase mb-4">Live Preview</h2>
                            <PreviewProductCard p={editing} />
                        </div>

                        {/* Edit panel */}
                        <div className="border-4 border-black bg-[#CFE8F3] p-5 shadow-[6px_6px_0_0_#000]">
                            <h2 className="text-lg font-black uppercase mb-4">Edit Product</h2>

                            <div className="flex flex-col gap-3">

                                <input
                                    className="border-2 border-black px-3 py-2 font-semibold bg-white"
                                    value={editing.title}
                                    onChange={(e) =>
                                        setEditing({ ...editing, title: e.target.value })
                                    }
                                    placeholder="Title"
                                />

                                <input
                                    className="border-2 border-black px-3 py-2 font-semibold bg-white"
                                    value={editing.artist}
                                    onChange={(e) =>
                                        setEditing({ ...editing, artist: e.target.value })
                                    }
                                    placeholder="Artist"
                                />

                                <textarea
                                    className="border-2 border-black px-3 py-2 font-semibold bg-white"
                                    value={editing.description}
                                    onChange={(e) =>
                                        setEditing({ ...editing, description: e.target.value })
                                    }
                                    placeholder="Description"
                                />

                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-1/2 border-2 border-black px-3 py-2 font-semibold bg-white" 
                                        value={editing.price}
                                        onChange={(e) =>
                                            setEditing({ ...editing, price: Number(e.target.value) })
                                        }
                                        placeholder="Price"
                                    />
                                    <input
                                        type="number"
                                        className="w-1/2 border-2 border-black px-3 py-2 font-semibold bg-white"
                                        value={editing.quantity}
                                        onChange={(e) =>
                                            setEditing({ ...editing, quantity: Number(e.target.value) })
                                        }
                                        placeholder="Qty"
                                    />
                                </div>

                                <input
                                    className="border-2 border-black px-3 py-2 font-semibold bg-white"
                                    value={editing.image_url}
                                    onChange={(e) =>
                                        setEditing({ ...editing, image_url: e.target.value })
                                    }
                                    placeholder="Image URL"
                                />

                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 border-2 border-black bg-black text-white py-2 font-black uppercase"
                                    >
                                        Save
                                    </button>

                                    <button
                                        onClick={() => setEditing(null)}
                                        className="flex-1 border-2 border-black bg-[#EDEDED] py-2 font-black uppercase"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}