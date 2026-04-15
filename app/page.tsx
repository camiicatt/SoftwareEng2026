import Link from "next/link";

type Product = {
  id: number | string;
  name?: string;
  title?: string;
  genre?: string;
  category?: string;
  image_url?: string;
  created_at?: string;
};

export default async function Home() {
  let vinyls: Product[] = [];
  let error: string | null = null;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/products/all`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    const data = await res.json();
    vinyls = Array.isArray(data) ? data.slice(0, 5) : [];
  } catch (err: any) {
    error = err?.message ?? "Failed to load new arrivals";
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7E8D6] text-[#1f1f1f]">
      {/* HERO */}
      <section className="relative w-full border-b-4 border-[#1f1f1f] bg-[#F7E8D6]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[#F7E8D6]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute left-1/2 top-0 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-[#F2D23C]/40 blur-3xl sm:h-[28rem] sm:w-[28rem] lg:h-[36rem] lg:w-[36rem]" />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#88A7A9]/30 blur-3xl sm:h-72 sm:w-72" />
          <div className="absolute -right-16 top-10 h-48 w-48 rounded-full bg-[#D97B66]/30 blur-3xl sm:h-64 sm:w-64" />
        </div>

        <div className="w-full px-4 py-10 sm:px-6 sm:py-16 lg:px-10 lg:py-24 xl:px-14 2xl:px-20">
          <div className="grid min-h-[70vh] items-center gap-10 xl:grid-cols-2 xl:gap-20">
            <div className="order-2 xl:order-1">
              <div className="inline-block border-2 border-[#1f1f1f] bg-[#F2D23C] px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
                Rare Pressings • Modern Classics • New Arrivals
              </div>

              <div className="max-w-3xl">
                <h1 className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl xl:text-[7.5rem] 2xl:text-[9rem]">
                  Sunset
                  <br />
                  Vinyl
                </h1>

                <p className="mt-5 max-w-2xl text-base sm:text-lg lg:text-xl font-semibold text-[#1f1f1f]/80">
                  Calling all vinyl lovers! Shop curated records,
                  discover fresh arrivals, and build your next favorite collection.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center border-4 border-[#1f1f1f] bg-[#88A7A9] px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wide transition hover:-translate-y-1"
                >
                  Shop All Records
                </Link>

              </div>
            </div>

            <div className="order-1 flex justify-center xl:order-2 xl:justify-end">
              <div className="relative">
                <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full border-4 border-[#1f1f1f] bg-[#D97B66] sm:-left-10 sm:-top-10 sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
                <div className="absolute -right-3 bottom-8 h-12 w-12 rounded-full border-4 border-[#1f1f1f] bg-[#88A7A9] sm:-right-6 sm:h-16 sm:w-16 lg:-right-8 lg:h-20 lg:w-20" />

                <div className="relative flex h-[18rem] w-[18rem] items-center justify-center rounded-full border-4 border-[#1f1f1f] bg-[#2d2d2d] shadow-[6px_6px_0px_#1f1f1f] sm:h-[22rem] sm:w-[22rem] lg:h-[28rem] lg:w-[28rem] xl:h-[32rem] xl:w-[32rem] 2xl:h-[36rem] 2xl:w-[36rem]">
                  <div className="absolute h-[14rem] w-[14rem] rounded-full border-4 border-[#1f1f1f] bg-[#111] sm:h-[17rem] sm:w-[17rem] lg:h-[22rem] lg:w-[22rem] xl:h-[24rem] xl:w-[24rem] 2xl:h-[27rem] 2xl:w-[27rem]" />
                  <div className="absolute flex h-[8rem] w-[8rem] items-center justify-center rounded-full border-4 border-[#1f1f1f] bg-[#F2D23C] sm:h-[9rem] sm:w-[9rem] lg:h-[11rem] lg:w-[11rem] xl:h-[12rem] xl:w-[12rem] 2xl:h-[13rem] 2xl:w-[13rem]">
                    <div className="h-6 w-6 rounded-full border-4 border-[#1f1f1f] bg-[#F7E8D6] sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10" />
                  </div>
                </div>

                <div className="absolute -right-2 top-3 rotate-[12deg] sm:-right-4 sm:top-4 lg:-right-6 lg:top-6 xl:-right-8">
                  <div className="border-4 border-[#1f1f1f] bg-[#D97B66] px-3 py-2 text-center text-xs sm:text-sm font-black uppercase leading-tight shadow-[4px_4px_0px_#1f1f1f]">
                    Fresh
                    <br />
                    Drops
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="w-full bg-[#F7E8D6]">
        <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-10 xl:px-14 2xl:px-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#1f1f1f]/70">
                Just Added
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight">
                New Arrivals
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center border-4 border-[#1f1f1f] bg-[#88A7A9] px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wide transition hover:-translate-y-1"
            >
              View All in Shop
            </Link>
          </div>

          {error ? (
            <div className="mt-6 border-4 border-[#1f1f1f] bg-white p-4">
              <p className="font-semibold">Could not load new arrivals.</p>
              <pre className="mt-2 overflow-auto text-sm">{error}</pre>
            </div>
          ) : vinyls.length === 0 ? (
            <div className="mt-6 border-4 border-[#1f1f1f] bg-white p-6">
              <p className="font-semibold">
                No products yet. Add inventory first.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {vinyls.map((v) => (
                <article
                  key={String(v.id)}
                  className="group overflow-hidden border-4 border-[#1f1f1f] bg-white transition hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1f1f1f]"
                >
                  <div className="relative">
                    {v.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.image_url}
                        alt={v.name ?? v.title ?? "Product image"}
                        className="h-56 w-full border-b-4 border-[#1f1f1f] object-cover sm:h-60 lg:h-64"
                      />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center border-b-4 border-[#1f1f1f] bg-[#F2D23C] text-4xl sm:h-60 lg:h-64 lg:text-5xl">
                        ♪
                      </div>
                    )}

                    <div className="absolute left-3 top-3 border-2 border-[#1f1f1f] bg-[#F7E8D6] px-2 py-1 text-[10px] sm:text-xs font-black uppercase">
                      New
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="truncate text-base sm:text-lg font-black uppercase tracking-tight">
                      {v.name ?? v.title ?? "Untitled"}
                    </h3>
                    <p className="mt-1 truncate text-xs sm:text-sm font-semibold text-[#1f1f1f]/70">
                      {v.genre ?? v.category ?? "Vinyl"}
                    </p>

                    <Link
                      href="/shop"
                      className="mt-4 inline-block text-xs sm:text-sm font-black uppercase underline underline-offset-4"
                    >
                      See in Shop
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}