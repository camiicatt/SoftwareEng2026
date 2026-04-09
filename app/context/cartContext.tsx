"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartProduct = {
    id: number | string;
    title: string;
    artist: string;
    description?: string;
    price: number;
    quantity?: number;
    image_url: string;
    category: string;
};

type CartItem = {
    id: number | string;
    title: string;
    artist: string;
    price: number;
    image_url: string;
    category: string;
    cartQuantity: number;
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: CartProduct) => void;
    removeFromCart: (id: number | string) => void;
    updateQuantity: (id: number | string, qty: number) => void;
    clearCart: () => void;
    subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) {
            setCartItems(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    function addToCart(product: CartProduct) {
        console.log("ADDING:", product);

        setCartItems((prev) => {
            const existing = prev.find((i) => i.id === product.id);

            if (existing) {
                return prev.map((i) =>
                    i.id === product.id
                        ? { ...i, cartQuantity: i.cartQuantity + 1 }
                        : i
                );
            }

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

    function removeFromCart(id: number | string) {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
    }

    function updateQuantity(id: number | string, qty: number) {
        setCartItems((prev) =>
            prev.map((i) =>
                i.id === id ? { ...i, cartQuantity: Math.max(1, qty) } : i
            )
        );
    }

    function clearCart() {
        setCartItems([]);
    }

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.cartQuantity,
        0
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