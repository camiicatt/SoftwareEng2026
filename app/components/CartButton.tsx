"use client";

import Link from "next/link";
import { useCart } from "@/app/context/cartContext";

export default function CartButton() {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center rounded-sm border-2 border-black bg-[#F2D23C] px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-white"
    >
      Cart

      {cartCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-black bg-red-500 px-1 text-[11px] font-black text-white">
          {cartCount}
        </span>
      )}
    </Link>
  );
}