import ProductsClient from "@/app/api/products/products-client";

export default function ProductsPage() {
  return (
    <main className="px-5 pb-16 pt-10">
      <ProductsClient />
    </main>
  );
}