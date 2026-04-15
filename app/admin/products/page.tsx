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

const productCategories = ["Vinyl", "CD"] as const;


function normalizeProduct(p: RawProduct): Product {
    return {
        id: p.id ?? p.product_id ?? p.uuid ?? crypto.randomUUID(),
        title: String(p.title ?? p.name ?? "Untitled"),
        artist: String(p.artist ?? "Unknown Artist"),
        description: String(p.description ?? ""),
        price: Number(p.price ?? 0),
        quantity: Number(p.quantity ?? 0),
        image_url: String(p.image_url ?? ""),
        category: String(p.category ?? "Vinyl"),
    };
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

function money(n: number) {
    return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

/* ---------------------- Product Card --------------------- */

function ProductCard({
    p,
    onEdit,
}: {
    p: Product;
    onEdit: (p: Product) => void;
}) {
    return (
        <div className="cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white p-3 shadow hover:scale-105 transition-transform relative">
            <img
                src={p.image_url}
                alt={p.title}
                className="w-full h-40 object-cover rounded-lg"
                loading="lazy"
            />
            <div className="mt-2 font-black text-sm">{p.title}</div>
            <div className="text-xs font-semibold text-neutral-700">{p.artist}</div>
            <div className="mt-1 text-xs font-bold text-neutral-900">
                {money(p.price)}
            </div>

            <button
                onClick={() => onEdit(p)}
                className="absolute top-2 right-2 border-2 border-black px-3 py-1 text-xs font-black uppercase bg-[#EDEDED] hover:bg-[#88A7A9] hover:text-white rounded"
            >
                Edit
            </button>
        </div>
    );
}

/* ---------------------- Live Preview --------------------- */

function Preview({ p }: { p: Product | null }) {
    if (!p) {
        return (
            <div className="text-sm font-semibold text-black/60">
                Select a product to preview
            </div>
        );
    }

    return (
        <article className="relative border-4 border-black bg-white shadow-[6px_6px_0_0_#000]">

            <div className="absolute left-3 top-3 z-10">
                <div
                    className={`border-2 border-black px-3 py-1 text-[11px] font-black uppercase ${badgeStyle(
                        p.quantity
                    )}`}
                >
                    {badgeText(p.quantity)}
                </div>
            </div>

            <div className="relative aspect-[4/5] w-full overflow-hidden border-b-4 border-black bg-[#EAF4F4]">
                <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                />
            </div>

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

                    <div className="border-2 border-black bg-[#F2D23C] px-3 py-1 text-sm font-black">
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

                    <span className="ml-auto text-xs font-black uppercase">
                        Qty {p.quantity}
                    </span>
                </div>
            </div>
        </article>
    );
}

/* ---------------------- Edit Panel --------------------- */

function EditForm({
    product,
    setProduct,
    onSave,
    onCancel,
}: {
    product: Product;
    setProduct: (p: Product) => void;
    onSave: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="border-4 border-black bg-[#CFE8F3] p-6 shadow-[8px_8px_0_0_#000]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                        Edit Product
                    </h2>
                    <p className="text-sm font-semibold text-black/75">
                        Update this item in the products table.
                    </p>
                </div>
            </div>

            <div className="space-y-5">

                {/* name + artist */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-black/80">
                            Name
                        </label>
                        <input
                            className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                            value={product.title}
                            onChange={(e) =>
                                setProduct({ ...product, title: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-black/80">
                            Artist
                        </label>
                        <input
                            className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                            value={product.artist}
                            onChange={(e) =>
                                setProduct({ ...product, artist: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* Price + qty + category */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-black/80">
                            Price
                        </label>
                        <input
                            className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                            inputMode="decimal"
                            value={product.price}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    price: Number(e.target.value),
                                })
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-black/80">
                            Quantity
                        </label>
                        <input
                            className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                            inputMode="numeric"
                            value={product.quantity}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    quantity: Number(e.target.value),
                                })
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-black/80">
                            Category
                        </label>

                        <select
                            className="w-full border-2 border-black bg-white px-3 py-2.5 font-black uppercase outline-none"
                            value={product.category}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    category: e.target.value,
                                })
                            }
                        >
                            {productCategories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Cover image */}
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-black/80">
                        Cover Image
                    </label>

                    <div className="border-2 border-dashed border-black bg-[#EAF4F4] px-3 py-4">
                        <input
                            className="w-full border-2 border-black px-3 py-2.5 font-semibold"
                            value={product.image_url}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    image_url: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-black/80">
                        Description
                    </label>

                    <textarea
                        className="min-h-[120px] w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                        value={product.description}
                        onChange={(e) =>
                            setProduct({
                                ...product,
                                description: e.target.value,
                            })
                        }
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onSave}
                        className="w-full border-2 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-widest text-[#FFF3E6] hover:bg-[#88A7A9] hover:text-white rounded"
                    >
                        Save Changes
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full border-2 border-black bg-white px-5 py-3 text-sm font-black uppercase tracking-widest hover:bg-[#D97B66] hover:text-white rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------------------- Full page --------------------- */

export default function ProductsPageLivePreview() {
    const { addToCart } = useCart();

    const [allItems, setAllItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [draftProduct, setDraftProduct] = useState<Product | null>(null);

    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("title");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);

            const res = await fetch(`/api/products/all`, { cache: "no-store" });
            const data = await res.json();

            const arr = Array.isArray(data) ? data : data?.data;
            const normalized = arr.map(normalizeProduct);

            if (!cancelled) setAllItems(normalized);
            setLoading(false);
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

        if (category !== "All") {
            filtered = filtered.filter((p) => p.category === category);
        }

        const sorted = [...filtered];

        if (sort === "title")
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        if (sort === "price") sorted.sort((a, b) => a.price - b.price);
        if (sort === "-price") sorted.sort((a, b) => b.price - a.price);

        return sorted;
    }, [allItems, category, sort]);

    const startEdit = (p: Product) => {
        setSelectedProduct(p);
        setDraftProduct(p);
    };

    const cancelEdit = () => {
        setSelectedProduct(null);
        setDraftProduct(null);
    };

    const saveEdit = async () => {
        if (!draftProduct) return;

        const res = await fetch(`/api/products/${draftProduct.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draftProduct),
        });

        const updated = await res.json();

        setAllItems((prev) =>
            prev.map((p) =>
                p.id === updated.id ? normalizeProduct(updated) : p
            )
        );

        setSelectedProduct(null);
        setDraftProduct(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">

            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-black uppercase">Edit Products</h1>
                <Link href="/admin" className="underline">
                    Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">

                {/* Left panel */}
                <div className="space-y-4">

                    {!selectedProduct && (
                        <div className="flex gap-4 mb-4">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-1/2 border rounded-lg px-3 py-2"
                            >
                                {categories.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>

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
                    )}

                    {!selectedProduct && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                items.map((p) => (
                                    <ProductCard
                                        key={String(p.id)}
                                        p={p}
                                        onEdit={startEdit}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {selectedProduct && draftProduct && (
                        <EditForm
                            product={draftProduct}
                            setProduct={setDraftProduct}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                        />
                    )}
                </div>

                {/* Right panel */}
                <div className="sticky top-6 h-fit">
                    <Preview p={draftProduct ?? selectedProduct} />
                </div>

            </div>
        </div>
    );
}