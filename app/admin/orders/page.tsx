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

export default function AdminOrdersPage() {
  const supabase = createClientBrowser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("created_at");
  const [isAdmin, setIsAdmin] = useState(false);

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
      .order(field, { ascending: field !== "total_price" ? false : true });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: OrderStatus) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
  
    if (error) {
      console.error(error);
      return;
    }
  
    await loadOrders(sortField);
  }

  if (!isAdmin) return <div className="p-6">Checking authorization...</div>;

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase">Order History</h1>
        <a className="underline underline-offset-4" href="/admin">
          Back to Dashboard
        </a>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-3">
        <span className="text-sm font-black uppercase">Sort by:</span>
        {["created_at", "total_price", "status"].map((field) => (
          <button
            key={field}
            onClick={() => { setSortField(field); loadOrders(field); }}
            className={`text-xs font-black uppercase border-2 border-black px-3 py-1 ${sortField === field ? "bg-black text-white" : "bg-white"}`}
          >
            {field === "created_at" ? "Date" : field === "total_price" ? "Price" : "Status"}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="border-2 border-black p-4 bg-white">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border-4 border-black p-4 bg-white shadow-[6px_6px_0_0_#000]">
              <div className="flex items-center justify-between">
                <div className="font-black uppercase text-sm">Order #{order.id.slice(0, 8)}</div>
                <div className="text-xs opacity-70">{order.created_at
  ? new Date(order.created_at).toLocaleDateString()
  : "No date"}</div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-black">Total:</span> ${order.total_price.toFixed(2)}</div>
                <div><span className="font-black">Tax:</span> ${order.tax.toFixed(2)}</div>
                <div><span className="font-black">Discount:</span> {order.discount_code || "None"}</div>
                <div><span className="font-black">User:</span> {order.user_id.slice(0, 8)}...</div>
              </div>
              <div className="mt-3 flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(order.id, s)}
                  className={`text-xs font-black uppercase border-2 border-black px-2 py-1 ${
                    order.status === s ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {s}
                </button>
              ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}