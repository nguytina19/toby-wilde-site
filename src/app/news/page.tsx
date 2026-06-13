import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/news";
import { press } from "@/data/press";
import { container } from "@/lib/layout";

export const metadata: Metadata = {
  title: "News",
};

export default function NewsPage() {
  return (
    <>
      <section className="border-b border-slate-200">
        <div className={`${container} py-16 sm:py-20`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Press &amp; Media
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            News
          </h1>
          <p className="mt-4 max-w-xl text-slate-500">
            Awards, press coverage, podcast appearances, and company updates.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className={container}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/9] bg-slate-100">
                  {article.image && (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                        article.imageWidth &&
                        article.imageHeight &&
                        article.imageHeight > article.imageWidth
                          ? "object-[50%_18%]"
                          : ""
                      }`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-5">
                  <time className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {article.date}
                  </time>
                  <h2 className="mt-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-slate-600">
                    {article.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured In */}
      <section className="border-t border-slate-200 py-16 sm:py-20">
        <div className={container}>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured In</h2>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            {press.map((pub) =>
              pub.logo ? (
                <Image
                  key={pub.name}
                  src={pub.logo}
                  alt={pub.name}
                  width={pub.w}
                  height={pub.h}
                  unoptimized={pub.svg}
                  className="h-7 w-auto max-w-[150px] object-contain opacity-60 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
                />
              ) : (
                <span
                  key={pub.name}
                  className="text-base font-semibold tracking-tight text-slate-400"
                >
                  {pub.name}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
    </>
  );
}
