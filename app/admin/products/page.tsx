"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import GenericToast from "@/app/components/GenericToast";

type RawProduct = any;

type Product = {
    id: number;
    name: string;
    artist: string;
    description: string;
    price: number;
    sale_price: number | null;
    quantity: number;
    image_url: string;
    category: string;
    genre: string;
};
const productCategories = ["Vinyl", "CD"] as const;

function normalizeProduct(p: RawProduct): Product {
    return {
        id: Number(p.id ?? p.product_id),
        name: String(p.title ?? p.name ?? "Untitled"),
        artist: String(p.artist ?? "Unknown Artist"),
        description: String(p.description ?? ""),
        price: Number(p.price ?? 0),
        sale_price:
            p.sale_price === null || p.sale_price === undefined || p.sale_price === ""
                ? null
                : Number(p.sale_price),
        quantity: Number(p.quantity ?? 0),
        image_url: String(p.image_url ?? ""),
        category: String(p.category ?? "Vinyl"),
        genre: String(p.genre ?? "Unknown"),
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

function isOnSale(p: Product) {
    return p.sale_price !== null && Number.isFinite(p.sale_price) && p.sale_price < p.price;
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
                alt={p.name}
                className="w-full h-40 object-cover rounded-lg"
                loading="lazy"
            />
            <div className="mt-2 font-black text-sm">{p.name}</div>
            <div className="text-xs font-semibold text-neutral-700">{p.artist}</div>
            <div className="mt-1">
                {isOnSale(p) ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-red-600">
                            {money(p.sale_price!)}
                        </span>
                        <span className="text-xs font-bold text-neutral-500 line-through">
                            {money(p.price)}
                        </span>
                    </div>
                ) : (
                    <div className="text-xs font-bold text-neutral-900">
                        {money(p.price)}
                    </div>
                )}
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
                    alt={p.name}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="space-y-3 p-4">
                <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-black uppercase">
                            {p.name}
                        </h3>
                        <p className="truncate text-sm font-bold text-black/75">
                            {p.artist}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {isOnSale(p) ? (
                            <>
                                <div className="border-2 border-black bg-[#FF8A80] px-3 py-1 text-sm font-black">
                                    {money(p.sale_price!)}
                                </div>
                                <div className="text-xs font-black text-black/50 line-through">
                                    {money(p.price)}
                                </div>
                            </>
                        ) : (
                            <div className="border-2 border-black bg-[#F2D23C] px-3 py-1 text-sm font-black">
                                {money(p.price)}
                            </div>
                        )}
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

function validate(p: Product) {
    const newErrors: Record<string, string> = {};

    if (!p.name.trim()) newErrors.name = "Name is required";
    if (!p.artist.trim()) newErrors.artist = "Artist is required";

    if (isNaN(Number(p.price)) || Number(p.price) <= 0) {
        newErrors.price = "Price must be greater than 0";
    }

    if (!Number.isInteger(p.quantity) || p.quantity < 0) {
        newErrors.quantity = "Quantity must be 0 or more";
    }

    if (!p.genre.trim()) newErrors.genre = "Genre is required";

    if (!p.image_url.trim()) newErrors.image_url = "Cover image is required";

    if (p.sale_price !== null) {
        const sale = Number(p.sale_price);
        const price = Number(p.price);

        if (!Number.isFinite(sale) || sale < 0) {
            newErrors.sale_price = "Sale price must be 0 or more";
        } else if (sale >= price) {
            newErrors.sale_price = "Sale price must be less than regular price";
        }
    }

    return newErrors;
}

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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSave = () => {
        const cleaned = {
            ...product,
            price: parseFloat(product.price as any),
        };

        const validationErrors = validate(cleaned);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        onSave(); // only if valid
    };

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
                            value={product.name}
                            onChange={(e) =>
                                setProduct({ ...product, name: e.target.value })
                            }
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 font-bold">
                                {errors.name}
                            </p>
                        )}
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
                        {errors.artist && (
                            <p className="text-xs text-red-600 font-bold">
                                {errors.artist}
                            </p>
                        )}
                    </div>
                </div>

                {/* Price + qty + category */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-black/80">
                        Sale Price
                    </label>
                    <input
                        className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                        inputMode="decimal"
                        placeholder="Leave blank for no sale"
                        value={product.sale_price ?? ""}
                        onChange={(e) =>
                            setProduct({
                                ...product,
                                sale_price: e.target.value === "" ? null : Number(e.target.value),
                            })
                        }
                    />
                    {errors.sale_price && (
                        <p className="text-xs text-red-600 font-bold">
                            {errors.sale_price}
                        </p>
                    )}
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
                        {errors.quantity && (
                            <p className="text-xs text-red-600 font-bold">
                                {errors.quantity}
                            </p>
                        )}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Genre */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-black/80">
                            Genre
                        </label>

                        <input
                            className="w-full border-2 border-black bg-white px-3 py-2.5 font-semibold outline-none"
                            value={product.genre}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
                                    genre: e.target.value,
                                })
                            }
                        />
                        {errors.genre && (
                            <p className="text-xs text-red-600 font-bold">
                                {errors.genre}
                            </p>
                        )}
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
                        {errors.image_url && (
                            <p className="text-xs text-red-600 font-bold mt-1">
                                {errors.image_url}
                            </p>
                        )}
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
                        onClick={handleSave}
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
    const supabase: any = createClientBrowser();

    const [allItems, setAllItems] = useState<Product[]>([]);
    const [sort, setSort] = useState("title");
    const [loading, setLoading] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [draftProduct, setDraftProduct] = useState<Product | null>(null);

    const [category, setCategory] = useState("All");

    const [isAdmin, setIsAdmin] = useState(false);

    // Toast for update message
    const [toast, setToast] = useState({ show: false, message: "" });

    const showToast = (message: string) => {
        setToast({ show: true, message });
    };

    const hideToast = () => {
        setToast({ show: false, message: "" });
    };

    useEffect(() => {
        // Admin check
        const checkAdmin = async () => {
            const { data: userRes } = await supabase.auth.getUser();
            const userEmail = userRes.user?.email ?? null;

            if (!userEmail) {
                window.location.assign("/admin/login");
                return;
            }

            const { data } = await supabase
                .from("admins")
                .select("email")
                .eq("email", userEmail)
                .maybeSingle();

            if (!data) {
                window.location.assign("/admin/login");
                return;
            }

            setIsAdmin(true);
        }

        checkAdmin();
        if (!setIsAdmin) return;

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
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === "price") sorted.sort((a, b) => a.price - b.price);
        if (sort === "-price") sorted.sort((a, b) => b.price - a.price);

        return sorted;
    }, [allItems, category, sort]);

    const startEdit = (p: Product) => {
        setSelectedProduct(p);
        setDraftProduct({ ...p });
    };

    const cancelEdit = () => {
        setSelectedProduct(null);
        setDraftProduct(null);
    };

    const saveEdit = async () => {
        if (!draftProduct) return;

        const res = await fetch(`/products/update/${draftProduct.id}`, {
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

        showToast("Product updated successfully!");
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <GenericToast show={toast.show} message={toast.message} onClose={hideToast} />
            
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