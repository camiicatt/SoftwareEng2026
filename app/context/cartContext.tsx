"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartProduct = {
  id: number;
  title: string;
  artist: string;
  description?: string;
  price: number;
  quantity?: number;
  image_url: string;
  category: string;
};

type CartItem = {
  id: number;
  title: string;
  artist: string;
  price: number;
  image_url: string;
  category: string;
  cartQuantity: number;
};

type ToastState = {
  show: boolean;
  message: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  cartCount: number;
  toast: ToastState;
  hideToast: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as CartItem[];
      setCartItems(parsed);
    } catch {
      localStorage.removeItem("cart");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  function showToast(message: string) {
    setToast({ show: true, message });

    window.clearTimeout((showToast as any)._timer);
    (showToast as any)._timer = window.setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2200);
  }

  function hideToast() {
    setToast({ show: false, message: "" });
  }

  function addToCart(product: CartProduct) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);

      if (existing) {
        showToast(`Added another "${product.title}" to cart`);
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, cartQuantity: i.cartQuantity + 1 }
            : i
        );
      }

      showToast(`Added "${product.title}" to cart`);

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          artist: product.artist,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
          cartQuantity: 1,
        },
      ];
    });
  }

  function removeFromCart(id: number) {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: number, qty: number) {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cartQuantity: Math.max(1, qty) } : i
      )
    );
  }

  function clearCart() {
    setCartItems([]);
    showToast("Checkout complete. Cart updated.");
  }

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.cartQuantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        cartCount,
        toast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}