import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/news";
import { companies } from "@/data/companies";
import { container } from "@/lib/layout";

export default function Home() {
  const latestNews = articles.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200">
        <div className={`${container} flex min-h-[calc(100svh-4rem)] flex-col justify-end pb-10 pt-24`}>
          <h1 className="font-serif text-4xl font-normal leading-[0.95] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Toby Wilde
          </h1>
          <p className="font-serif text-4xl font-normal leading-[0.95] tracking-tight text-[#7e8ca2] sm:text-5xl lg:text-6xl">
            PropTech entrepreneur
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600">
            Founder of Oparo and co-founding partner of Sprift — bringing data-driven investment
            to real estate that puts communities first.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:bg-slate-700"
            >
              Learn More
            </Link>
            <Link
              href="/contact"
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-50 active:bg-slate-100"
            >
              Get in Touch
            </Link>
          </div>

          {/* Company logo strip */}
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4">
            {companies.map((company) => (
              <div key={company.name} className="flex items-center gap-2.5">
                {company.logo && (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={company.w}
                    height={company.h}
                    unoptimized={company.svg}
                    className={`h-7 w-auto max-w-[130px] object-contain${
                      company.invert ? " invert" : ""
                    }`}
                  />
                )}
                {!company.wordmark && (
                  <span className="text-base font-semibold tracking-tight text-slate-700">
                    {company.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className={container}>
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
        <div className={container}>
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
        <div className={`${container} py-16 text-center sm:py-20`}>
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
