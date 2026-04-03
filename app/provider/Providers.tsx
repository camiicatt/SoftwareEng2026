"use client";

import { CartProvider } from '@/app/context/cartContext';

export default function Providers({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    return <CartProvider>{children}</CartProvider>;
}