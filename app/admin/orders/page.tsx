"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

type OrderStatus = "pending" | "completed" | "cancelled";
const STATUS_OPTIONS: OrderStatus[] = ["pending", "completed", "cancelled"];

type Order = {
    id: string;
    user_id: string;
    total_price: number;
    tax: number;
    discount_code: string | null;
    status: OrderStatus | null;
    created_at: string | null;
};

type Customer = {
    id: string;
    full_name: string;
    email: string | null;
};

type Product = {
    id: string;
    name: string;
    artist: string | null;
    image_url?: string | null;
};

type OrderItem = {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    product?: Product | null;
};

type SearchableOrder = Order & {
    customer: Customer | null;
    items: OrderItem[];
};

type SelectedOrderDetails = {
    order: Order;
    customer: Customer | null;
    items: OrderItem[];
};

function getStatusClasses(status: OrderStatus | null) {
    switch (status) {
        case "completed":
            return "bg-green-100 border-green-700";
        case "cancelled":
            return "bg-red-100 border-red-700";
        case "pending":
        default:
            return "bg-yellow-100 border-yellow-700";
    }
}

function getTabButtonClasses(activeTab: OrderStatus, tab: OrderStatus) {
    if (activeTab !== tab) {
        return "bg-white text-black border-black";
    }

    switch (tab) {
        case "completed":
            return "bg-green-700 text-white border-green-900";
        case "cancelled":
            return "bg-red-700 text-white border-red-900";
        case "pending":
        default:
            return "bg-yellow-400 text-black border-yellow-900";
    }
}

export default function AdminOrdersPage() {
    const supabase = createClientBrowser();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState("created_at");
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<SelectedOrderDetails | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchableOrders, setSearchableOrders] = useState<SearchableOrder[]>([]);
    const [activeTab, setActiveTab] = useState<OrderStatus>("pending");

    useEffect(() => {
        (async () => {
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
            await loadOrders("created_at");
        })();
    }, []);

    async function loadOrders(field: string) {
        setLoading(true);

        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order(field, {
                ascending:
                    field === "total_price" ? true : field === "user_id" ? true : false,
            });

        if (error || !data) {
            setLoading(false);
            return;
        }

        setOrders(data as Order[]);

        const userIds = [...new Set(data.map((order) => order.user_id).filter(Boolean))];
        const orderIds = data.map((order) => order.id);

        let customers: Customer[] = [];
        let items: OrderItem[] = [];
        let products: Product[] = [];

        if (userIds.length > 0) {
            const { data: customerData } = await supabase
                .from("customers")
                .select("id, full_name, email")
                .in("id", userIds as any);

            customers = (customerData as Customer[]) || [];
        }

        if (orderIds.length > 0) {
            const { data: itemData } = await supabase
                .from("order_items")
                .select("*")
                .in("order_id", orderIds as any);

            items = (itemData as unknown as OrderItem[]) || [];
        }

        const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];

        if (productIds.length > 0) {
            const { data: productData } = await supabase
                .from("products")
                .select("id, name, artist, image_url")
                .in("id", productIds as any);

            products = (productData as unknown as Product[]) || [];
        }

        const enriched: SearchableOrder[] = data.map((order) => {
            const customer =
                customers.find((customer) => customer.id === order.user_id) || null;

            const orderItems = items
                .filter((item) => item.order_id === order.id)
                .map((item) => ({
                    ...item,
                    product:
                        products.find((product) => String(product.id) === String(item.product_id)) ||
                        null,
                }));

            return {
                ...(order as Order),
                customer,
                items: orderItems,
            };
        });

        setSearchableOrders(enriched);
        setLoading(false);
    }

    async function updateStatus(id: string, newStatus: OrderStatus) {
        try {
            const currentOrder = searchableOrders.find((order) => order.id === id);

            if (!currentOrder) {
                alert("Order not found.");
                return;
            }

            const oldStatus: OrderStatus = currentOrder.status ?? "pending";

            if (oldStatus === "completed" || oldStatus === "cancelled") {
                return;
            }

            if (oldStatus === newStatus) return;

            if (oldStatus !== "pending") return;

            if (newStatus === "cancelled") {
                const items: OrderItem[] = currentOrder.items || [];

                if (items.length > 0) {
                    const productIds = items.map((item) => item.product_id);

                    const { data: productRows, error: fetchError } = await supabase
                        .from("products")
                        .select("id, quantity")
                        .in("id", productIds as any);

                    if (fetchError) {
                        console.error(fetchError);
                        alert("Failed to restock items.");
                        return;
                    }

                    const quantityMap = new Map<string, number>(
                        (productRows || []).map((p: any) => [
                            String(p.id),
                            Number(p.quantity ?? 0),
                        ])
                    );

                    for (const item of items) {
                        const currentQty = quantityMap.get(String(item.product_id));

                        if (currentQty === undefined) {
                            alert(`Product ${item.product_id} not found.`);
                            return;
                        }

                        const newQty = currentQty + Number(item.quantity);

                        const { error: updateError } = await supabase
                            .from("products")
                            .update({ quantity: newQty })
                            .eq("id", Number(item.product_id));

                        if (updateError) {
                            console.error(updateError);
                            alert("Failed to restock product.");
                            return;
                        }
                    }
                }
            }

            const { error } = await supabase
                .from("orders")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) {
                console.error(error);
                alert("Failed to update status.");
                return;
            }

            await loadOrders(sortField);

            if (selectedOrder && selectedOrder.order.id === id) {
                setSelectedOrder({
                    ...selectedOrder,
                    order: {
                        ...selectedOrder.order,
                        status: newStatus,
                    },
                });
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    }

    if (!isAdmin) return <div className="p-6">Checking authorization...</div>;

    const searchedOrders = searchableOrders.filter((order) => {
        const words = searchTerm
            .toLowerCase()
            .split(" ")
            .map((word) => word.trim())
            .filter(Boolean);

        if (words.length === 0) return true;

        return words.every((word) => {
            const matchesOrder =
                order.id.toLowerCase().includes(word) ||
                order.user_id.toLowerCase().includes(word) ||
                (order.status || "").toLowerCase().includes(word) ||
                (order.discount_code || "").toLowerCase().includes(word) ||
                order.total_price.toFixed(2).includes(word) ||
                order.tax.toFixed(2).includes(word) ||
                (order.customer?.full_name || "").toLowerCase().includes(word) ||
                (order.customer?.email || "").toLowerCase().includes(word) ||
                (order.created_at
                        ? new Date(order.created_at).toLocaleDateString().toLowerCase()
                        : ""
                ).includes(word) ||
                (order.created_at || "").toLowerCase().includes(word);

            const matchesItems = (order.items || []).some((item) =>
                (item.product?.name || "").toLowerCase().includes(word) ||
                (item.product?.artist || "").toLowerCase().includes(word) ||
                String(item.quantity).includes(word) ||
                Number(item.price_at_purchase).toFixed(2).includes(word)
            );

            return matchesOrder || matchesItems;
        });
    });

    const displayedOrders = searchedOrders.filter((order) => {
        const status = (order.status ?? "pending") as OrderStatus;
        return status === activeTab;
    });

    return (
        <div className="p-6 max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black uppercase">Order History</h1>
                <a className="underline underline-offset-4" href="/admin">
                    Back to Dashboard
                </a>
            </div>

            <div className="flex gap-3 flex-wrap">
                <span className="text-sm font-black uppercase">Sort by:</span>
                {["created_at", "total_price", "user_id"].map((field) => (
                    <button
                        key={field}
                        onClick={() => {
                            setSortField(field);
                            loadOrders(field);
                        }}
                        className={`text-xs font-black uppercase border-2 border-black px-3 py-1 ${
                            sortField === field ? "bg-black text-white" : "bg-white"
                        }`}
                    >
                        {field === "created_at"
                            ? "Date"
                            : field === "total_price"
                                ? "Price"
                                : "Customer ID"}
                    </button>
                ))}
            </div>

            <input
                type="text"
                placeholder="Search orders, customers, products, artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
            />

            <div className="flex gap-3 flex-wrap">
                {STATUS_OPTIONS.map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        className={`border-2 px-4 py-2 text-xs font-black uppercase ${getTabButtonClasses(
                            activeTab,
                            status
                        )}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div>Loading orders...</div>
            ) : displayedOrders.length === 0 ? (
                <div className="border-2 border-black p-4 bg-white">
                    No matching orders found.
                </div>
            ) : (
                <div className="space-y-4">
                    {displayedOrders.map((order) => (
                        <div
                            key={order.id}
                            onClick={async () => {
                                try {
                                    setDetailsLoading(true);

                                    const customer = order.customer || null;
                                    const items = (order.items || []).map((item) => ({
                                        ...item,
                                    }));

                                    setSelectedOrder({
                                        order: {
                                            id: order.id,
                                            user_id: order.user_id,
                                            total_price: order.total_price,
                                            tax: order.tax,
                                            discount_code: order.discount_code,
                                            status: order.status,
                                            created_at: order.created_at,
                                        },
                                        customer,
                                        items,
                                    });
                                } catch (err) {
                                    console.error(err);
                                    alert("Failed to load order details");
                                } finally {
                                    setDetailsLoading(false);
                                }
                            }}
                            className={`border-4 p-4 shadow-[6px_6px_0_0_#000] cursor-pointer hover:scale-[1.01] transition ${getStatusClasses(
                                order.status
                            )}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-black uppercase text-sm">
                                    Order #{order.id.slice(0, 8)}
                                </div>
                                <div className="text-xs opacity-70">
                                    {order.created_at
                                        ? new Date(order.created_at).toLocaleDateString()
                                        : "No date"}
                                </div>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="font-black">Total:</span> $
                                    {order.total_price.toFixed(2)}
                                </div>
                                <div>
                                    <span className="font-black">Tax:</span> $
                                    {order.tax.toFixed(2)}
                                </div>
                                <div>
                                    <span className="font-black">Discount:</span>{" "}
                                    {order.discount_code || "None"}
                                </div>
                                <div>
                                    <span className="font-black">User:</span>{" "}
                                    {order.user_id.slice(0, 8)}...
                                </div>
                            </div>

                            <div className="mt-3 flex gap-2 flex-wrap">
                                {(order.status === "pending" || order.status === null) ? (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                const confirmed = window.confirm(
                                                    "Mark this order as completed?"
                                                );

                                                if (!confirmed) return;

                                                updateStatus(order.id, "completed");
                                            }}
                                            className="text-xs font-black uppercase border-2 border-black px-3 py-1 bg-green-100"
                                        >
                                            complete
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                const confirmed = window.confirm(
                                                    "Cancel this order and restock its items?"
                                                );

                                                if (!confirmed) return;

                                                updateStatus(order.id, "cancelled");
                                            }}
                                            className="text-xs font-black uppercase border-2 border-black px-3 py-1 bg-red-100"
                                        >
                                            cancel
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-xs font-black uppercase opacity-60">
                                        Status locked
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {detailsLoading ? (
                            <div>Loading details...</div>
                        ) : (
                            <>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-black uppercase">
                                        Order #{selectedOrder.order.id.slice(0, 8)}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="border-2 border-black px-3 py-1 text-xs font-black uppercase bg-white"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-black">Customer:</span>{" "}
                                        {selectedOrder.customer?.full_name || "Unknown"}
                                    </div>
                                    <div>
                                        <span className="font-black">Email:</span>{" "}
                                        {selectedOrder.customer?.email || "No email"}
                                    </div>
                                    <div>
                                        <span className="font-black">User ID:</span>{" "}
                                        {selectedOrder.order.user_id}
                                    </div>
                                    <div>
                                        <span className="font-black">Status:</span>{" "}
                                        {selectedOrder.order.status || "pending"}
                                    </div>
                                    <div>
                                        <span className="font-black">Total:</span> $
                                        {selectedOrder.order.total_price.toFixed(2)}
                                    </div>
                                    <div>
                                        <span className="font-black">Tax:</span> $
                                        {selectedOrder.order.tax.toFixed(2)}
                                    </div>
                                    <div>
                                        <span className="font-black">Discount:</span>{" "}
                                        {selectedOrder.order.discount_code || "None"}
                                    </div>
                                    <div>
                                        <span className="font-black">Created:</span>{" "}
                                        {selectedOrder.order.created_at
                                            ? new Date(selectedOrder.order.created_at).toLocaleString()
                                            : "No date"}
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <h3 className="mb-2 text-sm font-black uppercase">Items</h3>

                                    {selectedOrder.items.length === 0 ? (
                                        <div className="text-sm">No items found.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedOrder.items.map((item) => (
                                                <div key={item.id} className="border-2 border-black p-3">
                                                    <div className="font-black">
                                                        {item.product?.name || "Unknown Product"}
                                                    </div>

                                                    <div className="text-xs opacity-70">
                                                        {item.product?.artist || "Unknown Artist"}
                                                    </div>

                                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="font-black">Qty:</span>{" "}
                                                            {item.quantity}
                                                        </div>
                                                        <div>
                                                            <span className="font-black">Price:</span> $
                                                            {Number(item.price_at_purchase).toFixed(2)}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="font-black">Line Total:</span> $
                                                            {(
                                                                Number(item.price_at_purchase) *
                                                                Number(item.quantity)
                                                            ).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 flex gap-2 flex-wrap">
                                    {(selectedOrder.order.status === "pending" ||
                                        selectedOrder.order.status === null) ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const confirmed = window.confirm(
                                                        "Mark this order as completed?"
                                                    );

                                                    if (!confirmed) return;

                                                    updateStatus(selectedOrder.order.id, "completed");
                                                }}
                                                className="text-xs font-black uppercase border-2 border-black px-3 py-2 bg-green-100"
                                            >
                                                Mark completed
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const confirmed = window.confirm(
                                                        "Cancel this order and restock its items?"
                                                    );

                                                    if (!confirmed) return;

                                                    updateStatus(selectedOrder.order.id, "cancelled");
                                                }}
                                                className="text-xs font-black uppercase border-2 border-black px-3 py-2 bg-red-100"
                                            >
                                                Mark cancelled
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-xs font-black uppercase opacity-60">
                                            This order can no longer be changed.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}