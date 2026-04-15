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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
          <div className="group grid min-h-[70vh] items-center gap-10 xl:grid-cols-2 xl:gap-20">
            <div className="order-2 xl:order-1">
              <div className="inline-block border-2 border-[#1f1f1f] bg-[#F2D23C] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] sm:text-xs">
                Rare Pressings • Modern Classics • New Arrivals
              </div>

              <div className="max-w-3xl">
                <h1 className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-6xl lg:text-7xl xl:text-[7.5rem] 2xl:text-[9rem]">
                  Sunset
                  <br />
                  Vinyl
                </h1>

                <p className="mt-5 max-w-2xl text-base font-semibold text-[#1f1f1f]/80 sm:text-lg lg:text-xl">
                  Calling all vinyl lovers! Shop curated records, discover fresh arrivals,
                  and build your next favorite collection.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center border-4 border-[#1f1f1f] bg-[#88A7A9] px-5 py-3 text-xs font-black uppercase tracking-wide shadow-[6px_6px_0px_#1f1f1f] transition hover:-translate-y-1 sm:text-sm"
                >
                  Shop All Records
                </Link>
              </div>
            </div>

            <div className="order-1 flex justify-center xl:order-2 xl:justify-end">
              <div className="relative cursor-pointer">
                <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full border-4 border-[#1f1f1f] bg-[#D97B66] transition-all duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12 sm:-left-10 sm:-top-10 sm:h-24 sm:w-24 lg:h-28 lg:w-28" />

                <div className="absolute -right-3 bottom-8 h-12 w-12 rounded-full border-4 border-[#1f1f1f] bg-[#88A7A9] transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:-rotate-12 sm:-right-6 sm:h-16 sm:w-16 lg:-right-8 lg:h-20 lg:w-20" />

                <div className="relative flex h-[18rem] w-[18rem] items-center justify-center rounded-full border-4 border-[#1f1f1f] bg-[#2d2d2d] shadow-[6px_6px_0px_#1f1f1f] transition-transform duration-300 group-hover:scale-[1.02] sm:h-[22rem] sm:w-[22rem] lg:h-[28rem] lg:w-[28rem] xl:h-[32rem] xl:w-[32rem] 2xl:h-[36rem] 2xl:w-[36rem]">
                  {/* spinning record */}
                  <div className="absolute flex h-[14rem] w-[14rem] items-center justify-center rounded-full border-4 border-[#1f1f1f] bg-[#111] animate-[spin_12s_linear_infinite] transition-transform duration-300 group-hover:animate-[spin_2.5s_linear_infinite] sm:h-[17rem] sm:w-[17rem] lg:h-[22rem] lg:w-[22rem] xl:h-[24rem] xl:w-[24rem] 2xl:h-[27rem] 2xl:w-[27rem]">
                    <div className="absolute h-[11rem] w-[11rem] rounded-full border-2 border-[#1f1f1f] border-dashed opacity-30 sm:h-[13rem] sm:w-[13rem] lg:h-[17rem] lg:w-[17rem] xl:h-[18.5rem] xl:w-[18.5rem] 2xl:h-[21rem] 2xl:w-[21rem]" />
                    <div className="absolute h-[7rem] w-[7rem] rounded-full border-2 border-[#1f1f1f] border-dashed opacity-25 sm:h-[8rem] sm:w-[8rem] lg:h-[10rem] lg:w-[10rem] xl:h-[11rem] xl:w-[11rem] 2xl:h-[12rem] 2xl:w-[12rem]" />
                  </div>

                  {/* center label */}
                  <div className="absolute flex h-[8rem] w-[8rem] items-center justify-center rounded-full border-4 border-[#1f1f1f] bg-[#F2D23C] transition-transform duration-300 group-hover:scale-105 sm:h-[9rem] sm:w-[9rem] lg:h-[11rem] lg:w-[11rem] xl:h-[12rem] xl:w-[12rem] 2xl:h-[13rem] 2xl:w-[13rem]">
                    <div className="h-6 w-6 rounded-full border-4 border-[#1f1f1f] bg-[#F7E8D6] sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10" />
                  </div>
                </div>

                <div className="absolute -right-2 top-3 rotate-[12deg] transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-[18deg] sm:-right-4 sm:top-4 lg:-right-6 lg:top-6 xl:-right-8">
                  <div className="border-4 border-[#1f1f1f] bg-[#D97B66] px-3 py-2 text-center text-xs font-black uppercase leading-tight shadow-[4px_4px_0px_#1f1f1f] sm:text-sm">
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

      {/* FEATURED CRATE */}
<section className="w-full border-b-4 border-[#1f1f1f] bg-[#FFF3E6]">
  <div className="w-full px-4 py-10 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1f1f1f]/70 sm:text-sm">
          New Arrivals
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl lg:text-4xl">
          Dig Through the Bin
        </h2>
      </div>

      <p className="max-w-xl text-sm font-semibold text-[#1f1f1f]/75">
        Pull a few records from our latest featured crate, showcasing a rotating selection of staff picks, hidden gems!
      </p>
    </div>

    <div className="group relative mx-auto max-w-6xl">
      {/* crate back */}
      <div className="relative h-[260px] border-4 border-[#1f1f1f] bg-[#C47E56] shadow-[8px_8px_0px_#1f1f1f] sm:h-[300px] lg:h-[340px]">
        {/* inner crate wall */}
        <div className="absolute inset-x-4 top-4 h-8 border-4 border-[#1f1f1f] bg-[#D99A73]" />

        {/* records */}
        <div className="absolute inset-x-3 bottom-10 flex items-end justify-center gap-2 overflow-hidden sm:gap-4">
          {(vinyls.length ? vinyls.slice(0, 5) : [1, 2, 3, 4, 5]).map((v: any, i: number) => {
            const hasData = typeof v === "object";
            const title = hasData ? v.name ?? v.title ?? "Untitled" : "Featured Record";
            const image = hasData ? v.image_url : null;
            const id = hasData ? v.id : i;

            const offsetClasses = [
              "translate-y-10 group-hover:translate-y-4",
              "translate-y-6 group-hover:-translate-y-1",
              "translate-y-12 group-hover:-translate-y-6",
              "translate-y-7 group-hover:translate-y-0",
              "translate-y-11 group-hover:translate-y-3",
            ];

            return (
              <Link
                key={String(id)}
                href="/shop"
                className={[
                  "relative block h-[180px] w-[100px] shrink-0 overflow-hidden border-4 border-[#1f1f1f] bg-white shadow-[5px_5px_0px_#1f1f1f] transition-all duration-300 hover:z-20 hover:-translate-y-3 hover:rotate-0 hover:shadow-[8px_8px_0px_#1f1f1f] sm:h-[220px] sm:w-[130px] lg:h-[250px] lg:w-[150px]",
                  i === 0 ? "-rotate-3" : "",
                  i === 1 ? "rotate-[-1.5deg]" : "",
                  i === 2 ? "rotate-[1deg]" : "",
                  i === 3 ? "rotate-[2deg]" : "",
                  i === 4 ? "rotate-[3deg]" : "",
                  offsetClasses[i] ?? "translate-y-10 group-hover:translate-y-0",
                ].join(" ")}
                title={title}
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#F2D23C] text-4xl">
                    ♪
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 border-t-4 border-[#1f1f1f] bg-[#F7E8D6] p-2">
                  <p className="truncate text-[10px] font-black uppercase leading-tight sm:text-xs">
                    {title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* crate front lip */}
        <div className="absolute inset-x-0 bottom-0 h-16 border-t-4 border-[#1f1f1f] bg-[#A85F3A] sm:h-20">
          <div className="flex h-full items-center justify-center">
            <div className="border-4 border-[#1f1f1f] bg-[#F2D23C] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_#1f1f1f] sm:text-sm">
              Featured Vinyl Bin
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* FEATURE STRIP */}
      <section className="w-full border-b-4 border-[#1f1f1f] bg-[#FFF3E6]">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border-4 border-[#1f1f1f] bg-[#F2D23C] p-5 shadow-[6px_6px_0px_#1f1f1f]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1f1f1f]/70">
                Curated
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase">Handpicked Vinyl</h3>
              <p className="mt-2 text-sm font-semibold text-[#1f1f1f]/75">
                From timeless favorites to fresh pressings worth spinning all weekend.
              </p>
            </div>

            <div className="border-4 border-[#1f1f1f] bg-[#88A7A9] p-5 shadow-[6px_6px_0px_#1f1f1f]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1f1f1f]/70">
                Weekly
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase">Fresh Drops</h3>
              <p className="mt-2 text-sm font-semibold text-[#1f1f1f]/75">
                New arrivals hit the shop often, so there is always something new to dig through.
              </p>
            </div>

            <div className="border-4 border-[#1f1f1f] bg-[#D97B66] p-5 shadow-[6px_6px_0px_#1f1f1f]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1f1f1f]/70">
                More Than Records
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase">Gear + Extras</h3>
              <p className="mt-2 text-sm font-semibold text-[#1f1f1f]/75">
                Build out your setup with accessories, instruments, and music essentials.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}