import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/news";

export default function Home() {
  const latestNews = articles.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            PropTech &middot; Real Estate &middot; Social Impact
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Building lasting, well-serviced communities
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
            Toby Wilde, Founder of Oparo Group, is passionate about construction and the
            building of lasting communities. From the multi-generational Milne real estate
            family to founding the UK&rsquo;s first algorithm-driven real estate investment
            company, Toby brings together technology, data, and purpose to deliver world-class
            social housing.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:bg-slate-700"
            >
              Learn More
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-50 active:bg-slate-100"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { stat: "£73m+", label: "Inaugural Fund Raise" },
              { stat: "130+", label: "Homes Delivered for Vulnerable Adults" },
              { stat: "6", label: "Award Categories in 2025" },
            ].map((item) => (
              <div key={item.label} className="px-6 py-10 text-center sm:py-14">
                <p className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {item.stat}
                </p>
                <p className="mt-2 text-sm text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Latest
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                News &amp; Press
              </h2>
            </div>
            <Link
              href="/news"
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {latestNews.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md"
              >
                <div className="relative overflow-hidden rounded-t-xl bg-slate-100">
                  <div className="aspect-[16/9]">
                    {article.image && (
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <time className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {article.date}
                  </time>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-slate-600">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Interested in speaking or collaboration?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-500">
            Toby is available for keynotes, panels, and podcast appearances on PropTech,
            social housing, and data-driven investment.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:bg-slate-700"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
