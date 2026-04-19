"use client";

import { useCart } from "@/app/context/cartContext";

type CartProduct = {
  id: number;
  title: string;
  artist: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
};

export default function AddToCartButton({
  product,
  className,
}: {
  product: CartProduct;
  className?: string;
}) {
  const { addToCart } = useCart();

  if (!product) return null;

  const disabled = product.quantity <= 0;

  return (
    <button
      onClick={() => addToCart(product)}
      disabled={disabled}
      className={
        className ??
        "w-full rounded-2xl border-2 border-black bg-black px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0_0_#000] hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
      }
    >
      Add to cart
    </button>
  );
}