"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useCart } from "@/app/context/cartContext";


function money(n: number) {
    const safe = Number.isFinite(n) ? n : 0;
    return `$${safe.toFixed(2)}`;
}

type Totals = {
    subtotal: number;
    discountAmount: number;
    tax: number;
    total: number;
};
export default function CartPage() {
    const supabase = createClientBrowser();
    const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();

    const [discountCode, setDiscountCode] = useState("");
    const [totals, setTotals] = useState<Totals | null>(null);
    const [loadingTotals, setLoadingTotals] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [placedOrderSummary, setPlacedOrderSummary] = useState<{
        itemCount: number;
        subtotal: number;
        tax: number;
        total: number;
        discountCode: string | null;
        items: {
            id: number;
            title: string;
            artist: string;
            image_url?: string | null;
            quantity: number;
            price: number;
        }[];
    } | null>(null);

    const orderItems = useMemo(
        () =>
          cartItems.map((item) => {
            const productId = Number(item.id);
      
            if (!Number.isFinite(productId)) {
              throw new Error(`Invalid product id: ${item.id}`);
            }
      
            return {
              product_id: productId,
              quantity: item.cartQuantity,
              price_at_purchase: item.price,
            };
          }),
        [cartItems]
      );

    async function parseJsonSafe(res: Response) {
        try {
            return await res.json();
        } catch {
            return null;
        }
    }

    async function calculateTotals() {
        if (orderItems.length === 0) {
            setTotals(null);
            return;
        }

        setLoadingTotals(true);
        setError("");
        setSuccessMessage("");

        try {
            const res = await fetch("/api/orders/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: orderItems,
                    discountCode: discountCode.trim(),
                }),
            });

            const data = await parseJsonSafe(res);

            if (!res.ok) {
                throw new Error(data?.error || "Failed to calculate totals");
            }

            setTotals(data);
        } catch (err: any) {
            setError(err?.message || "Failed to calculate totals");
            setTotals(null);
        } finally {
            setLoadingTotals(false);
        }
    }

    useEffect(() => {
        if (cartItems.length === 0) {
            setTotals(null);
            return;
        }

        calculateTotals();
    }, [cartItems]);

    async function placeOrder() {
        if (orderItems.length === 0) return;
      
        setPlacingOrder(true);
        setError("");
        setSuccessMessage("");
      
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
      
          if (!user) {
            setError("Please log in to place an order.");
            return;
          }
      
          // 1. Create order
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              user_id: user.id,
              total_price: subtotal,
              tax: subtotal * 0.08, // simple tax example
              status: "pending",
            })
            .select()
            .single();
      
          if (orderError) throw orderError;
      
          // 2. Insert order items
          const itemsToInsert = orderItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
          }));
      
          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(itemsToInsert);
      
          if (itemsError) throw itemsError;

            setPlacedOrderSummary({
                itemCount: cartItems.reduce((sum, item) => sum + item.cartQuantity, 0),
                subtotal: displayedSubtotal,
                tax: displayedTax,
                total: displayedTotal,
                discountCode: discountCode || null,
                items: cartItems.map((item) => ({
                    id: item.id,
                    title: item.title,
                    artist: item.artist,
                    image_url: item.image_url,
                    quantity: item.cartQuantity,
                    price: item.price,
                })),
            });

            setSuccessMessage("Order placed successfully!");
            clearCart();

            setSuccessMessage("Order placed successfully!");
            clearCart();
        } catch (err: any) {
          setError(err.message);
        } finally {
          setPlacingOrder(false);
        }
      }

      function handleQuantityChange(id: number, value: string) {
        const qty = Math.max(1, Number(value) || 1);
        updateQuantity(id, qty);
      }

      const displayedSubtotal = totals?.subtotal ?? subtotal;
      const displayedTax = totals?.tax ?? subtotal * 0.08;
      const displayedDiscount = totals?.discountAmount ?? 0;
      const displayedTotal = totals?.total ?? displayedSubtotal + displayedTax;
    
    return (
      <section className="pt-10">
        <h1 className="text-4xl font-black uppercase tracking-tight">Cart</h1>
        <p className="mt-2 text-sm font-semibold text-black/70">
          Your selected records and gear will show up here.
        </p>
          {cartItems.length === 0 ? (
        <div className="mt-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-bold">Your cart is empty.</p>
            {successMessage && (
                <div className="mt-4 border-4 border-green-700 bg-green-100 p-4 font-bold text-green-800 shadow-[4px_4px_0_0_#166534]">
                    <div>{successMessage}</div>

                    {placedOrderSummary && (
                        <div className="mt-4 border-t-2 border-green-700 pt-4 text-sm font-normal text-black">
                            <h3 className="mb-3 text-lg font-black uppercase text-green-800">
                                Order Summary
                            </h3>

                            <div className="mb-4 space-y-2">
                                <div>
                                    <span className="font-black">Items:</span>{" "}
                                    {placedOrderSummary.itemCount}
                                </div>
                                <div>
                                    <span className="font-black">Subtotal:</span>{" "}
                                    {money(placedOrderSummary.subtotal)}
                                </div>
                                <div>
                                    <span className="font-black">Tax:</span>{" "}
                                    {money(placedOrderSummary.tax)}
                                </div>
                                <div>
                                    <span className="font-black">Discount Code:</span>{" "}
                                    {placedOrderSummary.discountCode || "None"}
                                </div>
                                <div>
                                    <span className="font-black">Total:</span>{" "}
                                    {money(placedOrderSummary.total)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {placedOrderSummary.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-[70px_1fr] gap-3 border-2 border-green-700 bg-white p-3"
                                    >
                                        <div className="overflow-hidden border-2 border-black bg-neutral-100">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="h-[70px] w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-[70px] items-center justify-center text-[10px] font-black uppercase text-neutral-500">
                                                    No cover
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="font-black uppercase">{item.title}</div>
                                            <div className="text-xs opacity-70">{item.artist}</div>
                                            <div className="mt-1 text-xs">
                                                <span className="font-black">Qty:</span> {item.quantity}
                                            </div>
                                            <div className="text-xs">
                                                <span className="font-black">Price:</span> {money(item.price)}
                                            </div>
                                            <div className="text-xs">
                                                <span className="font-black">Line Total:</span>{" "}
                                                {money(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
          ) : (
          <>
              <div className="mt-6 space-y-4">
                  {cartItems.map((item) => (
                      <div
                          key={String(item.id)}
                          className="grid gap-4 border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:grid-cols-[110px_1fr_auto]"
                      >
                          <div className="overflow-hidden border-2 border-black bg-neutral-100">
                              {item.image_url ? (
                                  <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="h-[110px] w-full object-cover"
                                  />
                              ) : (
                                  <div className="flex h-[110px] items-center justify-center text-xs font-black uppercase text-neutral-500">
                                      No cover
                                  </div>
                              )}
                          </div>

                          <div className="min-w-0">
                              <h2 className="truncate text-lg font-black uppercase tracking-tight text-black">
                                  {item.title}
                              </h2>
                              <p className="text-sm font-bold text-black/75">{item.artist}</p>
                              <p className="mt-2 text-sm font-semibold text-black/70">
                                  {money(item.price)} each
                              </p>
                              <div className="mt-3 inline-block border-2 border-black bg-yellow-200 px-3 py-1 text-[11px] font-black uppercase text-black">
                                  {item.category}
                              </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 sm:items-end">
                              <div className="text-lg font-black text-black">
                                  {money(item.price * item.cartQuantity)}
                              </div>

                              <input
                                  type="number"
                                  min="1"
                                  value={item.cartQuantity}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                  className="w-20 border-2 border-black px-3 py-2 font-black"
                              />

                              <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="border-2 border-black px-4 py-2 font-black shadow-[4px_4px_0_0_#000]"
                              >
                                  Remove
                              </button>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="mt-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
                  <h2 className="text-lg font-black uppercase tracking-tight">Order Summary</h2>

                  <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="mt-4 w-full border-2 border-black bg-white px-3 py-2 text-black font-semibold outline-none"
                  />

                  <button
                      onClick={calculateTotals}
                      disabled={loadingTotals}
                      className="mt-3 border-2 border-black bg-yellow-200 px-4 py-2 font-black uppercase shadow-[4px_4px_0_0_#000] disabled:opacity-60"
                  >
                      {loadingTotals ? "Calculating..." : "Apply"}
                  </button>

                  <div className="mt-5 space-y-2 text-sm">
                      <div className="flex justify-between font-semibold text-black/80">
                          <span>Subtotal</span>
                          <span>{money(displayedSubtotal)}</span>
                      </div>

                      <div className="flex justify-between font-semibold text-black/80">
                          <span>Discount</span>
                          <span>-{money(displayedDiscount)}</span>
                      </div>

                      <div className="flex justify-between font-semibold text-black/80">
                          <span>Tax</span>
                          <span>{money(displayedTax)}</span>
                      </div>

                      <div className="mt-3 flex justify-between border-t-2 border-black pt-3 text-lg font-black">
                          <span>Total</span>
                          <span>{money(displayedTotal)}</span>
                      </div>
                  </div>

                  {error && <p className="mt-3 text-red-500 font-bold">{error}</p>}
                  {successMessage && <p className="mt-3 text-green-600 font-bold">{successMessage}</p>}

                  <button
                      onClick={placeOrder}
                      disabled={placingOrder || loadingTotals}
                      className="mt-5 border-2 border-black bg-[#F2D23C] px-6 py-3 font-black uppercase shadow-[4px_4px_0_0_#000] disabled:opacity-60"
                  >
                      {placingOrder ? "Placing..." : "Place Order"}
                  </button>

                  <Link href="/shop" className="block mt-4 font-bold underline">
                      Keep Shopping
                  </Link>
              </div>
          </>
          )}
      </section>
    );
}
